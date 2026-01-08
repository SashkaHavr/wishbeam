import { TRPCError } from "@trpc/server";
import z from "zod";

import { publicProcedure, router } from "#init.ts";
import { getWishlistItemLockStatus } from "#utils/utils.ts";
import { base62ToUuidv7, uuidv7ToBase62 } from "#utils/zod-utils.ts";
import { db } from "@wishbeam/db";

const wishlistOutputSchema = z.object({
  id: uuidv7ToBase62,
  title: z.string(),
  description: z.string(),
});

const wishlistItemOutputSchema = z.object({
  id: uuidv7ToBase62,
  title: z.string(),
  description: z.string(),
  links: z.array(z.string()),
  estimatedPrice: z.string().nullable(),
  lockStatus: z.enum(["lockedByCurrentUser", "lockedByAnotherUser", "unlocked"]),
});

const publicWishlistProcedure = publicProcedure
  .input(z.object({ wishlistId: base62ToUuidv7 }))
  .use(async ({ input, ctx, next }) => {
    const wishlist = await db.query.wishlist.findFirst({
      where: { id: input.wishlistId, shareStatus: "public" },
    });
    if (!wishlist) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Wishlist not found",
      });
    }
    return await next({
      ctx: {
        ...ctx,
        wishlist,
      },
    });
  });

export const publicWishlistsRouter = router({
  getById: publicWishlistProcedure
    .output(z.object({ wishlist: wishlistOutputSchema }))
    .query(({ ctx }) => {
      return { wishlist: ctx.wishlist };
    }),
  items: router({
    getAll: publicWishlistProcedure
      .output(z.object({ wishlistItems: z.array(wishlistItemOutputSchema) }))
      .query(async ({ ctx }) => {
        const wishlistItems = await db.query.wishlistItem.findMany({
          where: { wishlistId: ctx.wishlist.id, status: "active" },
          orderBy: { createdAt: "asc" },
        });
        return {
          wishlistItems: wishlistItems.map((item) => ({
            ...item,
            lockStatus: getWishlistItemLockStatus({
              lockUserId: item.lockedUserId,
            }),
          })),
        };
      }),
  }),
});
