import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import z from "zod";

import { router } from "#init.ts";
import { protectedProcedure } from "#procedures/protected-procedure.ts";
import { sharedWishlistProcedure } from "#procedures/shared-wishlist-procedure.ts";
import { invalidateCache } from "#utils/cache-invalidation.ts";
import { getWishlistItemLockStatus } from "#utils/utils.ts";
import { base62ToUuidv7, uuidv7ToBase62 } from "#utils/zod-utils.ts";
import { wishlistItem as wishlistItemTable } from "@wishbeam/db/schema";

const wishlistItemOutputSchema = z.object({
  id: uuidv7ToBase62,
  title: z.string(),
  description: z.string(),
  links: z.array(z.string()),
  estimatedPrice: z.string().nullable(),
  lockStatus: z.enum(["lockedByCurrentUser", "lockedByAnotherUser", "unlocked"]),
});

const sharedWishlistItemProcedure = protectedProcedure
  .input(z.object({ wishlistItemId: base62ToUuidv7 }))
  .use(async ({ input, ctx, next }) => {
    const wishlistItem = await ctx.db.query.wishlistItem.findFirst({
      where: {
        id: input.wishlistItemId,
        status: "active",
        wishlist: {
          OR: [
            { shareStatus: "public" },
            {
              shareStatus: "shared",
              wishlistSharedWith: { userId: ctx.userId },
            },
          ],
        },
      },
      with: { wishlist: true },
    });
    if (!wishlistItem) {
      throw new TRPCError({
        message: "Wishlist item not found",
        code: "NOT_FOUND",
      });
    }
    const { wishlist, ...restItem } = wishlistItem;
    return await next({
      ctx: {
        ...ctx,
        wishlistItem: restItem,
        wishlist: wishlist,
      },
    });
  });

export const sharedWishlistItemsRouter = router({
  getAll: sharedWishlistProcedure
    .output(z.object({ wishlistItems: z.array(wishlistItemOutputSchema) }))
    .query(async ({ ctx }) => {
      const wishlistItems = await ctx.db.query.wishlistItem.findMany({
        where: { wishlistId: ctx.wishlist.id, status: "active" },
        orderBy: { createdAt: "asc" },
      });
      return {
        wishlistItems: wishlistItems.map((item) => ({
          ...item,
          lockStatus: getWishlistItemLockStatus({
            lockUserId: item.lockedUserId,
            currentUserId: ctx.userId,
          }),
        })),
      };
    }),
  lock: sharedWishlistItemProcedure.mutation(async ({ ctx }) => {
    await ctx.db.transaction(async (tx) => {
      const item = (
        await tx
          .select()
          .from(wishlistItemTable)
          .where(eq(wishlistItemTable.id, ctx.wishlistItem.id))
          .for("update")
      )[0];
      if (!item) {
        throw new TRPCError({
          message: "Wishlist item not found",
          code: "NOT_FOUND",
        });
      }
      if (item.lockedUserId) {
        throw new TRPCError({
          message: "Wishlist item is already locked",
          code: "CONFLICT",
        });
      }
      await tx
        .update(wishlistItemTable)
        .set({ lockedUserId: ctx.userId, lockChangedAt: new Date() })
        .where(eq(wishlistItemTable.id, ctx.wishlistItem.id));
    });
    void invalidateCache(ctx.db, ctx.userId, {
      type: "wishlists",
      wishlistId: ctx.wishlist.id,
    });
  }),
  unlock: sharedWishlistItemProcedure.mutation(async ({ ctx }) => {
    await ctx.db.transaction(async (tx) => {
      const item = (
        await tx
          .select()
          .from(wishlistItemTable)
          .where(eq(wishlistItemTable.id, ctx.wishlistItem.id))
          .for("update")
      )[0];
      if (!item) {
        throw new TRPCError({
          message: "Wishlist item not found",
          code: "NOT_FOUND",
        });
      }
      if (!item.lockedUserId) {
        throw new TRPCError({
          message: "Wishlist item is not locked",
          code: "CONFLICT",
        });
      }
      await tx
        .update(wishlistItemTable)
        .set({ lockedUserId: null, lockChangedAt: new Date() })
        .where(eq(wishlistItemTable.id, ctx.wishlistItem.id));
    });
    void invalidateCache(ctx.db, ctx.userId, {
      type: "wishlists",
      wishlistId: ctx.wishlist.id,
    });
  }),
});
