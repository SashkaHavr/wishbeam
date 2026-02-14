import { TRPCError } from "@trpc/server";
import z from "zod";

import { base62ToUuidv7 } from "#utils/zod-utils.ts";

import { protectedProcedure } from "./protected-procedure";

export const ownedWishlistProcedure = protectedProcedure
  .input(z.object({ wishlistId: base62ToUuidv7 }))
  .use(async ({ input, ctx, next }) => {
    const wishlist = await ctx.db.query.wishlist.findFirst({
      where: { id: input.wishlistId, wishlistOwners: { userId: ctx.userId } },
      with: { wishlistOwners: true },
    });
    const currentOwner = wishlist?.wishlistOwners.find((wo) => wo.userId === ctx.userId);
    if (!wishlist || !currentOwner) {
      throw new TRPCError({
        message: "Wishlist not found",
        code: "NOT_FOUND",
      });
    }
    return await next({
      ctx: {
        ...ctx,
        wishlist,
        currentOwner,
      },
    });
  });
