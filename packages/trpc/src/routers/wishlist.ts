import { TRPCError } from '@trpc/server';

import { db } from '@wishbeam/db';
import {
  wishlistOwner as wishlistOwnerTable,
  wishlist as wishlistTable,
} from '@wishbeam/db/schema';
import { wishlistSchema } from '@wishbeam/utils/schemas';

import { protectedProcedure, router } from '#init.ts';
import { invalidateCache } from '#utils/cache-invalidation.ts';

export const wishlistRouter = router({
  getOwned: protectedProcedure.query(async ({ ctx }) => {
    const wishlists = await db.query.wishlist.findMany({
      where: { wishlistOwners: { userId: ctx.userId } },
    });
    return { wishlists };
  }),
  create: protectedProcedure
    .input(wishlistSchema)
    .mutation(async ({ input, ctx }) => {
      const wishlist = await db.transaction(async (tx) => {
        const [wishlist] = await tx
          .insert(wishlistTable)
          .values(input)
          .returning();
        if (!wishlist) {
          tx.rollback();
          return;
        }
        await tx.insert(wishlistOwnerTable).values({
          userId: ctx.userId,
          wishlistId: wishlist.id,
        });
        return wishlist;
      });
      if (!wishlist) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Could not create wishlist',
        });
      }
      invalidateCache(ctx.userId, { type: 'wishlists' });
      return wishlist;
    }),
});
