import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import z from 'zod';

import { db } from '@wishbeam/db';
import { wishlistItem as wishlistItemTable } from '@wishbeam/db/schema';
import { wishlistItemSchema } from '@wishbeam/utils/schemas';

import { ownedWishlistProcedure, protectedProcedure, router } from '#init.ts';
import { invalidateCache } from '#utils/cache-invalidation.ts';
import { base62ToUuidv7, uuidv7ToBase62 } from '#utils/zod-utils.ts';

const wishlistItemOutputSchema = z.object({
  id: uuidv7ToBase62,
  title: z.string(),
  description: z.string(),
  links: z.array(z.string()),
  estimatedPrice: z.string().nullable(),
  status: z.enum(['active', 'archived']),
});

const ownedWishlistItemProcedure = protectedProcedure
  .input(z.object({ wishlistItemId: base62ToUuidv7 }))
  .use(async ({ input, ctx, next }) => {
    const wishlistItem = await db.query.wishlistItem.findFirst({
      where: {
        id: input.wishlistItemId,
        wishlist: { wishlistOwners: { userId: ctx.userId } },
      },
      with: { wishlist: true },
    });
    if (!wishlistItem) {
      throw new TRPCError({
        message: 'Wishlist item not found',
        code: 'NOT_FOUND',
      });
    }
    const { wishlist, ...restItem } = wishlistItem;
    return next({
      ctx: {
        ...ctx,
        wishlistItem: restItem,
        wishlist: wishlist,
      },
    });
  });

export const ownedWishlistItemsRouter = router({
  getAll: ownedWishlistProcedure
    .output(z.object({ wishlistItems: z.array(wishlistItemOutputSchema) }))
    .query(async ({ ctx }) => {
      const wishlistItems = await db.query.wishlistItem.findMany({
        where: { wishlistId: ctx.wishlist.id },
        orderBy: { createdAt: 'asc' },
      });
      return { wishlistItems };
    }),
  create: ownedWishlistProcedure
    .input(wishlistItemSchema)
    .output(z.object({ wishlistItem: wishlistItemOutputSchema }))
    .mutation(async ({ input, ctx }) => {
      const wishlistItem = (
        await db
          .insert(wishlistItemTable)
          .values({ ...input, wishlistId: ctx.wishlist.id })
          .returning()
      )[0];
      if (!wishlistItem) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Could not create wishlist item',
        });
      }
      void invalidateCache(ctx.userId, {
        type: 'wishlists',
        wishlistId: ctx.wishlist.id,
      });
      return { wishlistItem };
    }),

  update: ownedWishlistItemProcedure
    .input(z.object({ data: wishlistItemSchema.partial() }))
    .output(z.undefined())
    .mutation(async ({ input, ctx }) => {
      await db
        .update(wishlistItemTable)
        .set({ ...input.data, updatedAt: new Date() })
        .where(eq(wishlistItemTable.id, ctx.wishlistItem.id));
      void invalidateCache(ctx.userId, {
        type: 'wishlists',
        wishlistId: ctx.wishlist.id,
      });
    }),
  delete: ownedWishlistItemProcedure
    .output(z.undefined())
    .mutation(async ({ ctx }) => {
      await db
        .delete(wishlistItemTable)
        .where(eq(wishlistItemTable.id, ctx.wishlistItem.id));
      void invalidateCache(ctx.userId, {
        type: 'wishlists',
        wishlistId: ctx.wishlist.id,
      });
    }),
  setStatus: ownedWishlistItemProcedure
    .input(z.object({ status: z.enum(['active', 'archived']) }))
    .output(z.undefined())
    .mutation(async ({ input, ctx }) => {
      if (ctx.wishlistItem.status === input.status) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: `Wishlist item is already ${input.status}`,
        });
      }

      await db
        .update(wishlistItemTable)
        .set({
          status: input.status,
          updatedAt: new Date(),
          lockedUserId: null,
          lockChangedAt: new Date(),
        })
        .where(eq(wishlistItemTable.id, ctx.wishlistItem.id));
      void invalidateCache(ctx.userId, {
        type: 'wishlists',
        wishlistId: ctx.wishlist.id,
      });
    }),
});
