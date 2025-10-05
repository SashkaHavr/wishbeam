import { TRPCError } from '@trpc/server';
import { and, eq } from 'drizzle-orm';
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

const ownedWishlistProcedure = protectedProcedure
  .input(z.object({ id: z.uuidv7() }))
  .use(async ({ input, ctx, next }) => {
    const wishlist = await db.query.wishlist.findFirst({
      where: { id: input.id, wishlistOwners: { userId: ctx.userId } },
    });
    if (!wishlist) {
      throw new TRPCError({
        message: 'Wishlist not found',
        code: 'UNPROCESSABLE_CONTENT',
      });
    }
    return next({
      ctx: {
        ...ctx,
        wishlist: wishlist,
      },
    });
  });

export const ownedWishlistRouter = router({
  getAll: protectedProcedure
    .output(z.object({ wishlists: z.array(wishlistOutputSchema) }))
    .query(async ({ ctx }) => {
      const wishlists = await db.query.wishlist.findMany({
        where: { wishlistOwners: { userId: ctx.userId } },
        orderBy: { createdAt: 'asc' },
      });
      return { wishlists };
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
      invalidateCache(ctx.userId, { type: 'wishlists.getAll' });
      return { newWishlist: wishlist };
    }),

  getById: ownedWishlistProcedure
    .output(z.object({ wishlist: wishlistOutputSchema }))
    .query(({ ctx }) => {
      return { wishlist: ctx.wishlist };
    }),
  update: ownedWishlistProcedure
    .input(z.object({ data: wishlistSchema.partial() }))
    .output(z.undefined())
    .mutation(async ({ input, ctx }) => {
      await db
        .update(wishlistTable)
        .set(input.data)
        .where(eq(wishlistTable.id, ctx.wishlist.id));
      invalidateCache(ctx.userId, { type: 'wishlists.getAll' });
      invalidateCache(ctx.userId, {
        type: 'wishlists.getById',
        wishlistId: ctx.wishlist.id,
      });
    }),
  delete: ownedWishlistProcedure
    .output(z.undefined())
    .mutation(async ({ ctx }) => {
      await db.transaction(async (tx) => {
        await tx
          .delete(wishlistOwnerTable)
          .where(
            and(
              eq(wishlistOwnerTable.wishlistId, ctx.wishlist.id),
              eq(wishlistOwnerTable.userId, ctx.userId),
            ),
          );
        const ownersLeft = await tx.$count(
          wishlistOwnerTable,
          eq(wishlistOwnerTable.wishlistId, ctx.wishlist.id),
        );
        if (ownersLeft === 0) {
          await tx
            .delete(wishlistTable)
            .where(eq(wishlistTable.id, ctx.wishlist.id));
        }
      });
      invalidateCache(ctx.userId, { type: 'wishlists.getAll' });
      invalidateCache(ctx.userId, {
        type: 'wishlists.getById',
        wishlistId: ctx.wishlist.id,
      });
    }),
});
