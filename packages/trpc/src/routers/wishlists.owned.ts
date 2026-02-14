import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import z from "zod";

import { router } from "#init.ts";
import { ownedWishlistProcedure } from "#procedures/owned-wishlist-procedure.ts";
import { protectedProcedure } from "#procedures/protected-procedure.ts";
import { invalidateCache } from "#utils/cache-invalidation.ts";
import { base62ToUuidv7, uuidv7ToBase62 } from "#utils/zod-utils.ts";
import {
  wishlistItem as wishlistItemTable,
  wishlistOwner as wishlistOwnerTable,
  wishlist as wishlistTable,
} from "@wishbeam/db/schema";
import { wishlistSchema } from "@wishbeam/utils/schemas";

import { ownedWishlistItemsRouter } from "./wishlists.owned.items";
import { ownedWishlistOwnersRouter } from "./wishlists.owned.owners";
import { ownedWishlistSharedWithRouter } from "./wishlists.owned.sharedWith";

const wishlistOutputSchema = z.object({
  id: uuidv7ToBase62,
  title: z.string(),
  description: z.string(),
  currentUserIsCreator: z.boolean(),
  shareStatus: z.enum(["private", "shared", "public"]),
});

export const ownedWishlistsRouter = router({
  getAll: protectedProcedure
    .output(z.object({ wishlists: z.array(wishlistOutputSchema) }))
    .query(async ({ ctx }) => {
      const wishlists = await ctx.db.query.wishlist.findMany({
        where: { wishlistOwners: { userId: ctx.userId } },
        orderBy: { createdAt: "asc" },
        with: { wishlistOwners: true },
      });
      return {
        wishlists: wishlists.map((w) => ({
          ...w,
          currentUserIsCreator:
            w.wishlistOwners.find((owner) => owner.id === ctx.userId)?.role === "creator",
        })),
      };
    }),
  create: protectedProcedure
    .input(wishlistSchema)
    .output(z.object({ wishlist: wishlistOutputSchema }))
    .mutation(async ({ input, ctx }) => {
      const wishlist = await ctx.db.transaction(async (tx) => {
        const [wishlist] = await tx.insert(wishlistTable).values(input).returning();
        if (!wishlist) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Could not create wishlist",
          });
        }
        await tx.insert(wishlistOwnerTable).values({
          userId: ctx.userId,
          wishlistId: wishlist.id,
          role: "creator",
        });
        return wishlist;
      });
      void invalidateCache(ctx.db, ctx.userId, {
        type: "wishlists",
        wishlistId: wishlist.id,
      });
      return {
        wishlist: {
          ...wishlist,
          currentUserIsCreator: true,
        },
      };
    }),

  getById: ownedWishlistProcedure
    .output(z.object({ wishlist: wishlistOutputSchema }))
    .query(({ ctx }) => {
      return {
        wishlist: {
          ...ctx.wishlist,
          currentUserIsCreator: ctx.currentOwner.role === "creator",
        },
      };
    }),
  update: ownedWishlistProcedure
    .input(z.object({ data: wishlistSchema.partial() }))
    .output(z.undefined())
    .mutation(async ({ input, ctx }) => {
      await ctx.db
        .update(wishlistTable)
        .set({ ...input.data, updatedAt: new Date() })
        .where(eq(wishlistTable.id, ctx.wishlist.id));
      void invalidateCache(ctx.db, ctx.userId, {
        type: "wishlists",
        wishlistId: ctx.wishlist.id,
      });
    }),
  delete: ownedWishlistProcedure.output(z.undefined()).mutation(async ({ ctx }) => {
    const isCreator = ctx.currentOwner.role === "creator";
    await ctx.db.transaction(async (tx) => {
      await tx
        .delete(wishlistOwnerTable)
        .where(
          and(
            eq(wishlistOwnerTable.wishlistId, ctx.wishlist.id),
            isCreator ? undefined : eq(wishlistOwnerTable.userId, ctx.userId),
          ),
        );

      if (isCreator) {
        await tx.delete(wishlistTable).where(eq(wishlistTable.id, ctx.wishlist.id));
      }
    });
    void invalidateCache(ctx.db, ctx.userId, {
      type: "wishlists",
      wishlistId: ctx.wishlist.id,
    });
  }),
  setShareStatus: ownedWishlistProcedure
    .input(z.object({ shareStatus: z.enum(["private", "shared", "public"]) }))
    .output(z.undefined())
    .mutation(async ({ input, ctx }) => {
      if (ctx.wishlist.shareStatus === input.shareStatus) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `Wishlist is already ${input.shareStatus}`,
        });
      }
      await ctx.db.transaction(async (tx) => {
        await tx
          .update(wishlistTable)
          .set({ shareStatus: input.shareStatus, updatedAt: new Date() })
          .where(eq(wishlistTable.id, ctx.wishlist.id));
        if (input.shareStatus === "private") {
          await tx
            .update(wishlistItemTable)
            .set({ lockedUserId: null, lockChangedAt: new Date() })
            .where(eq(wishlistItemTable.wishlistId, ctx.wishlist.id));
        }
      });
      void invalidateCache(ctx.db, ctx.userId, {
        type: "wishlists",
        wishlistId: ctx.wishlist.id,
      });
    }),
  isOwned: protectedProcedure
    .input(z.object({ wishlistId: base62ToUuidv7 }))
    .output(z.object({ isOwned: z.boolean() }))
    .query(async ({ input, ctx }) => {
      const wishlist = await ctx.db.query.wishlist.findFirst({
        where: { id: input.wishlistId, wishlistOwners: { userId: ctx.userId } },
      });
      return {
        isOwned: !!wishlist,
      };
    }),

  sharedWith: ownedWishlistSharedWithRouter,
  owners: ownedWishlistOwnersRouter,
  items: ownedWishlistItemsRouter,
});
