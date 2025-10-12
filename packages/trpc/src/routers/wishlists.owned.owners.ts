import { TRPCError } from '@trpc/server';
import { and, eq } from 'drizzle-orm';
import z from 'zod';

import { db } from '@wishbeam/db';
import { wishlistOwner as wishlistOwnerTable } from '@wishbeam/db/schema';

import { ownedWishlistProcedure, router } from '#init.ts';
import { invalidateCache } from '#utils/cache-invalidation.ts';

const creatorProcedure = ownedWishlistProcedure.use(async ({ ctx, next }) => {
  if (ctx.currentOwner.role !== 'creator') {
    throw new TRPCError({
      message: 'This endpoint is only accessible to the wishlist creator',
      code: 'FORBIDDEN',
    });
  }
  return next();
});

const wishlistOwnerOutputSchema = z.object({
  id: z.string(),
  email: z.email(),
  role: z.enum(['creator', 'owner']),
});

export const ownedWishlistOwnersRouter = router({
  getAll: creatorProcedure
    .output(z.object({ owners: z.array(wishlistOwnerOutputSchema) }))
    .query(async ({ ctx }) => {
      const owners = await db.query.wishlistOwner.findMany({
        where: { wishlistId: ctx.wishlist.id },
        with: { user: true },
      });
      return {
        owners: owners.map((owner) => ({
          id: owner.user.id,
          email: owner.user.email,
          role: owner.role,
        })),
      };
    }),
  add: creatorProcedure
    .input(z.object({ email: z.email() }))
    .output(z.object({ owner: wishlistOwnerOutputSchema }))
    .mutation(async ({ input, ctx }) => {
      const newOwnerUser = await db.query.user.findFirst({
        where: { email: input.email },
      });
      if (!newOwnerUser) {
        throw new TRPCError({
          message: 'User not found',
          code: 'UNPROCESSABLE_CONTENT',
        });
      }
      const existingOwner = await db.query.wishlistOwner.findFirst({
        where: {
          wishlistId: ctx.wishlist.id,
          userId: newOwnerUser.id,
        },
      });
      if (existingOwner) {
        throw new TRPCError({
          message: 'User is already an owner',
          code: 'UNPROCESSABLE_CONTENT',
        });
      }
      const newOwner = (
        await db
          .insert(wishlistOwnerTable)
          .values({
            userId: newOwnerUser.id,
            wishlistId: ctx.wishlist.id,
            role: 'owner',
          })
          .returning()
      )[0];
      if (!newOwner) {
        throw new TRPCError({
          message: 'Failed to add owner',
          code: 'INTERNAL_SERVER_ERROR',
        });
      }
      void invalidateCache(ctx.userId, {
        type: 'wishlists',
        wishlistId: ctx.wishlist.id,
      });
      return { owner: { ...newOwner, email: newOwnerUser.email } };
    }),
  delete: creatorProcedure
    .input(z.object({ userId: z.uuidv7() }))
    .mutation(async ({ input, ctx }) => {
      if (input.userId === ctx.userId) {
        throw new TRPCError({
          message: 'You cannot remove yourself as an owner',
          code: 'UNPROCESSABLE_CONTENT',
        });
      }
      await db
        .delete(wishlistOwnerTable)
        .where(
          and(
            eq(wishlistOwnerTable.wishlistId, ctx.wishlist.id),
            eq(wishlistOwnerTable.userId, input.userId),
          ),
        );
      void invalidateCache(ctx.userId, {
        type: 'wishlists',
        wishlistId: ctx.wishlist.id,
      });
    }),
});
