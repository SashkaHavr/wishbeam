import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import z from "zod";

import { ownedWishlistProcedure, router } from "#init.ts";
import { invalidateCache } from "#utils/cache-invalidation.ts";
import { getUserByEmail, getUserById } from "#utils/db-utils.ts";
import { db } from "@wishbeam/db";
import { wishlistUsersSharedWith as wishlistUsersSharedWithTable } from "@wishbeam/db/schema";

const wishlistSharedWithOutputSchema = z.object({
  id: z.uuidv7(),
  name: z.string(),
  email: z.email(),
});

export const ownedWishlistSharedWithRouter = router({
  getAll: ownedWishlistProcedure
    .output(z.object({ users: z.array(wishlistSharedWithOutputSchema) }))
    .query(async ({ ctx }) => {
      const users = await db.query.wishlistUsersSharedWith.findMany({
        where: { wishlistId: ctx.wishlist.id },
        with: { user: true },
      });
      return {
        users: users.map((owner) => ({
          id: owner.user.id,
          email: owner.user.email,
          name: owner.user.name,
        })),
      };
    }),
  add: ownedWishlistProcedure
    .input(z.object({ email: z.email() }))
    .output(z.object({ user: wishlistSharedWithOutputSchema }))
    .mutation(async ({ input, ctx }) => {
      if (input.email === ctx.session.user.email) {
        throw new TRPCError({
          message: "You cannot share a wishlist with yourself",
          code: "UNPROCESSABLE_CONTENT",
        });
      }
      const newOwnerUser = await getUserByEmail(input.email);
      const existingOwner = await db.query.wishlistUsersSharedWith.findFirst({
        where: {
          wishlistId: ctx.wishlist.id,
          userId: newOwnerUser.id,
        },
      });
      if (existingOwner) {
        throw new TRPCError({
          message: "This wishlist is already shared with this user",
          code: "UNPROCESSABLE_CONTENT",
        });
      }
      const newSharedWithUser = (
        await db
          .insert(wishlistUsersSharedWithTable)
          .values({
            userId: newOwnerUser.id,
            wishlistId: ctx.wishlist.id,
          })
          .returning()
      )[0];
      if (!newSharedWithUser) {
        throw new TRPCError({
          message: "Failed to add user",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
      void invalidateCache(ctx.userId, {
        type: "wishlists",
        wishlistId: ctx.wishlist.id,
      });
      return {
        user: newOwnerUser,
      };
    }),
  delete: ownedWishlistProcedure
    .input(z.object({ userId: z.uuidv7() }))
    .mutation(async ({ input, ctx }) => {
      const userToDelete = await getUserById(input.userId);
      if (userToDelete.id === ctx.userId) {
        throw new TRPCError({
          message: "You cannot remove yourself as an owner",
          code: "UNPROCESSABLE_CONTENT",
        });
      }
      await db
        .delete(wishlistUsersSharedWithTable)
        .where(
          and(
            eq(wishlistUsersSharedWithTable.wishlistId, ctx.wishlist.id),
            eq(wishlistUsersSharedWithTable.userId, userToDelete.id),
          ),
        );
      void invalidateCache(ctx.userId, {
        type: "wishlists",
        wishlistId: ctx.wishlist.id,
      });
    }),
});
