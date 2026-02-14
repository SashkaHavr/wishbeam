import z from "zod";

import { router } from "#init.ts";
import { protectedProcedure } from "#procedures/protected-procedure.ts";
import { sharedWishlistProcedure } from "#procedures/shared-wishlist-procedure.ts";
import { invalidateCache } from "#utils/cache-invalidation.ts";
import { uuidv7ToBase62 } from "#utils/zod-utils.ts";
import { wishlistPublicUsersSavedShare as wishlistPublicUsersSavedShareTable } from "@wishbeam/db/schema";

import { sharedWishlistItemsRouter } from "./wishlists.shared.items";

const wishlistOutputSchema = z.object({
  id: uuidv7ToBase62,
  title: z.string(),
  description: z.string(),
});

export const sharedWishlistsRouter = router({
  getAll: protectedProcedure
    .output(
      z.object({
        wishlists: z.array(wishlistOutputSchema),
      }),
    )
    .query(async ({ ctx }) => {
      const wishlists = await ctx.db.query.wishlist.findMany({
        where: {
          OR: [
            {
              shareStatus: "public",
              OR: [
                { wishlistPublicSaved: { userId: ctx.userId } },
                { wishlistSharedWith: { userId: ctx.userId } },
              ],
            },
            {
              shareStatus: "shared",
              wishlistSharedWith: { userId: ctx.userId },
            },
          ],
        },
        orderBy: { createdAt: "asc" },
      });
      return { wishlists };
    }),
  getById: sharedWishlistProcedure
    .output(z.object({ wishlist: wishlistOutputSchema }))
    .query(({ ctx }) => {
      if (ctx.wishlist.shareStatus === "public") {
        void ctx.db.query.wishlistPublicUsersSavedShare
          .findFirst({
            where: { wishlistId: ctx.wishlist.id, userId: ctx.userId },
          })
          .then(async (res) => {
            if (!res) {
              await ctx.db.insert(wishlistPublicUsersSavedShareTable).values({
                wishlistId: ctx.wishlist.id,
                userId: ctx.userId,
              });
              await invalidateCache(ctx.db, ctx.userId, {
                type: "wishlists",
                wishlistId: ctx.wishlist.id,
              });
            }
          });
      }

      return { wishlist: ctx.wishlist };
    }),
  items: sharedWishlistItemsRouter,
});
