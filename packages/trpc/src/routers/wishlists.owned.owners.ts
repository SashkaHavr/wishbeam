import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import z from "zod";

import { router } from "#init.ts";
import { ownedWishlistProcedure } from "#procedures/owned-wishlist-procedure.ts";
import { invalidateCache } from "#utils/cache-invalidation.ts";
import { getUserByEmail, getUserById } from "#utils/db-utils.ts";
import { wishlistOwner as wishlistOwnerTable } from "@wishbeam/db/schema";

const creatorProcedure = ownedWishlistProcedure.use(async ({ ctx, next }) => {
  if (ctx.currentOwner.role !== "creator") {
    throw new TRPCError({
      message: "This endpoint is only accessible to the wishlist creator",
      code: "FORBIDDEN",
    });
  }
  return await next();
});

const wishlistOwnerOutputSchema = z.object({
  id: z.uuidv7(),
  email: z.email(),
  name: z.string(),
  role: z.enum(["creator", "owner"]),
});

export const ownedWishlistOwnersRouter = router({
  getAll: creatorProcedure
    .output(z.object({ owners: z.array(wishlistOwnerOutputSchema) }))
    .query(async ({ ctx }) => {
      const owners = await ctx.db.query.wishlistOwner.findMany({
        where: { wishlistId: ctx.wishlist.id },
        with: { user: true },
      });
      return {
        owners: owners.map((owner) => ({
          id: owner.user.id,
          email: owner.user.email,
          name: owner.user.name,
          role: owner.role,
        })),
      };
    }),
  add: creatorProcedure
    .input(z.object({ email: z.email() }))
    .output(z.object({ owner: wishlistOwnerOutputSchema }))
    .mutation(async ({ input, ctx }) => {
      if (input.email === ctx.session.user.email) {
        throw new TRPCError({
          message: "You cannot add yourself as an owner",
          code: "UNPROCESSABLE_CONTENT",
        });
      }
      const newOwnerUser = await getUserByEmail(ctx.db, input.email);
      const existingOwner = await ctx.db.query.wishlistOwner.findFirst({
        where: {
          wishlistId: ctx.wishlist.id,
          userId: newOwnerUser.id,
        },
      });
      if (existingOwner) {
        throw new TRPCError({
          message: "User is already an owner",
          code: "UNPROCESSABLE_CONTENT",
        });
      }
      const newOwner = (
        await ctx.db
          .insert(wishlistOwnerTable)
          .values({
            userId: newOwnerUser.id,
            wishlistId: ctx.wishlist.id,
            role: "owner",
          })
          .returning()
      )[0];
      if (!newOwner) {
        throw new TRPCError({
          message: "Failed to add owner",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
      void invalidateCache(ctx.db, ctx.userId, {
        type: "wishlists",
        wishlistId: ctx.wishlist.id,
      });
      return {
        owner: {
          ...newOwnerUser,
          role: newOwner.role,
        },
      };
    }),
  delete: creatorProcedure
    .input(z.object({ userId: z.uuidv7() }))
    .mutation(async ({ input, ctx }) => {
      const userToDelete = await getUserById(ctx.db, input.userId);
      if (userToDelete.id === ctx.userId) {
        throw new TRPCError({
          message: "You cannot remove yourself as an owner",
          code: "UNPROCESSABLE_CONTENT",
        });
      }
      await ctx.db
        .delete(wishlistOwnerTable)
        .where(
          and(
            eq(wishlistOwnerTable.wishlistId, ctx.wishlist.id),
            eq(wishlistOwnerTable.userId, userToDelete.id),
          ),
        );
      void invalidateCache(ctx.db, ctx.userId, {
        type: "wishlists",
        wishlistId: ctx.wishlist.id,
      });
    }),
});
