import { TRPCError } from '@trpc/server';
import { and, eq } from 'drizzle-orm';
import z from 'zod';

import { db } from '@wishbeam/db';
import {
  wishlistOwner as wishlistOwnerTable,
  wishlist as wishlistTable,
} from '@wishbeam/db/schema';
import { wishlistSchema } from '@wishbeam/utils/schemas';

import { ownedWishlistProcedure, protectedProcedure, router } from '#init.ts';
import { invalidateCache } from '#utils/cache-invalidation.ts';
import { ownedWishlistItemsRouter } from './wishlists.owned.items';
import { ownedWishlistOwnersRouter } from './wishlists.owned.owners';

const wishlistOutputSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  isCreator: z.boolean(),
});

export const ownedWishlistsRouter = router({
  getAll: protectedProcedure
    .output(z.object({ wishlists: z.array(wishlistOutputSchema) }))
    .query(async ({ ctx }) => {
      const wishlists = await db.query.wishlist.findMany({
        where: { wishlistOwners: { userId: ctx.userId } },
        orderBy: { createdAt: 'asc' },
        with: { wishlistOwners: true },
      });
      return {
        wishlists: wishlists.map((w) => ({
          ...w,
          isCreator:
            w.wishlistOwners.find((owner) => owner.userId === ctx.userId)
              ?.role === 'creator',
        })),
      };
    }),
  create: protectedProcedure
    .input(wishlistSchema)
    .output(z.object({ wishlist: wishlistOutputSchema }))
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
          role: 'creator',
        });
        return wishlist;
      });
      return { wishlist: { ...wishlist, isCreator: true } };
    }),

  getById: ownedWishlistProcedure
    .output(z.object({ wishlist: wishlistOutputSchema }))
    .query(({ ctx }) => {
      return {
        wishlist: {
          ...ctx.wishlist,
          isCreator: ctx.currentOwner.role === 'creator',
        },
      };
    }),
  update: ownedWishlistProcedure
    .input(z.object({ data: wishlistSchema.partial() }))
    .output(z.undefined())
    .mutation(async ({ input, ctx }) => {
      await db
        .update(wishlistTable)
        .set(input.data)
        .where(eq(wishlistTable.id, ctx.wishlist.id));
      void invalidateCache(ctx.userId, {
        type: 'wishlists',
        wishlistId: ctx.wishlist.id,
      });
    }),
  delete: ownedWishlistProcedure
    .output(z.undefined())
    .mutation(async ({ ctx }) => {
      const isCreator = ctx.currentOwner.role === 'creator';
      await db.transaction(async (tx) => {
        await tx
          .delete(wishlistOwnerTable)
          .where(
            and(
              eq(wishlistOwnerTable.wishlistId, ctx.wishlist.id),
              !isCreator
                ? eq(wishlistOwnerTable.userId, ctx.userId)
                : undefined,
            ),
          );

        if (isCreator) {
          await tx
            .delete(wishlistTable)
            .where(eq(wishlistTable.id, ctx.wishlist.id));
        }
      });
      void invalidateCache(ctx.userId, {
        type: 'wishlists',
        wishlistId: ctx.wishlist.id,
      });
    }),

  owners: ownedWishlistOwnersRouter,
  items: ownedWishlistItemsRouter,
});
