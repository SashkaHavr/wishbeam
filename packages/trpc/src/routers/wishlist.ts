import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import z from 'zod';

import { db } from '@wishbeam/db';
import {
  wishlistOwner as wishlistOwnerTable,
  wishlist as wishlistTable,
} from '@wishbeam/db/schema';
import { wishlistSchema } from '@wishbeam/utils/schemas';

import { protectedProcedure, router } from '#init.ts';
import { invalidateCache } from '#utils/cache-invalidation.ts';

const wishlistOutputSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
});

export const wishlistRouter = router({
  getOwned: protectedProcedure
    .output(z.object({ wishlists: z.array(wishlistOutputSchema) }))
    .query(async ({ ctx }) => {
      const wishlists = await db.query.wishlist.findMany({
        where: { wishlistOwners: { userId: ctx.userId } },
        orderBy: { createdAt: 'asc' },
      });
      return { wishlists };
    }),
  getById: protectedProcedure
    .input(z.object({ id: z.uuidv7() }))
    .output(z.object({ wishlist: wishlistOutputSchema }))
    .query(async ({ input, ctx }) => {
      const wishlist = await db.query.wishlist.findFirst({
        where: { id: input.id, wishlistOwners: { userId: ctx.userId } },
      });
      if (!wishlist) {
        throw new TRPCError({
          code: 'UNPROCESSABLE_CONTENT',
          message: 'Wishlist not found',
        });
      }
      return { wishlist };
    }),
  create: protectedProcedure
    .input(wishlistSchema)
    .output(z.object({ newWishlist: wishlistOutputSchema }))
    .mutation(async ({ input, ctx }) => {
      const wishlist = await db.transaction(async (tx) => {
        const [wishlist] = await tx
          .insert(wishlistTable)
          .values(input)
          .returning();
        if (!wishlist) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Could not create wishlist',
          });
        }
        await tx.insert(wishlistOwnerTable).values({
          userId: ctx.userId,
          wishlistId: wishlist.id,
        });
        return wishlist;
      });
      invalidateCache(ctx.userId, { type: 'wishlists' });
      return { newWishlist: wishlist };
    }),
  update: protectedProcedure
    .input(z.object({ id: z.uuidv7(), data: wishlistSchema.partial() }))
    .output(z.undefined())
    .mutation(async ({ input, ctx }) => {
      await db.transaction(async (tx) => {
        const wishlist = (
          await tx
            .select()
            .from(wishlistTable)
            .where(eq(wishlistTable.id, input.id))
            .for('update')
            .limit(1)
        )[0];
        if (!wishlist) {
          throw new TRPCError({
            code: 'UNPROCESSABLE_CONTENT',
            message: 'Wishlist not found',
          });
        }
        await tx
          .update(wishlistTable)
          .set(input.data)
          .where(eq(wishlistTable.id, input.id));
      });
      invalidateCache(ctx.userId, { type: 'wishlists' });
      invalidateCache(ctx.userId, {
        type: 'wishlist-data',
        wishlistId: input.id,
      });
    }),
});
