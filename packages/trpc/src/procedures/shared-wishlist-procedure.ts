import { TRPCError } from "@trpc/server";
import z from "zod";

import { base62ToUuidv7 } from "#utils/zod-utils.ts";

import { protectedProcedure } from "./protected-procedure";

export const sharedWishlistProcedure = protectedProcedure
  .input(z.object({ wishlistId: base62ToUuidv7 }))
  .use(async ({ input, ctx, next }) => {
    const wishlist = await ctx.db.query.wishlist.findFirst({
      where: {
        id: input.wishlistId,
        OR: [
          { shareStatus: "public" },
          { shareStatus: "shared", wishlistSharedWith: { userId: ctx.userId } },
        ],
      },
      with: { wishlistOwners: true },
    });
    if (!wishlist) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Wishlist not found",
      });
    }
    if (wishlist.wishlistOwners.some((wo) => wo.userId === ctx.userId)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Owners cannot access shared wishlist endpoints",
      });
    }
    return await next({
      ctx: {
        ...ctx,
        wishlist,
      },
    });
  });
