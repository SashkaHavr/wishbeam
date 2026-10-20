import { Context, Effect, Layer } from "effect";

import { CurrentUser } from "@wishbeam/api-contract/context";
import { WishlistNotFound } from "@wishbeam/api-contract/features/wishlists";
import type { IdBranded } from "@wishbeam/db/id-branded";

import { WishlistRepo } from "./repo";

export class WishlistAccess extends Context.Service<WishlistAccess>()("api/WishlistAccess", {
  make: Effect.gen(function* () {
    const repo = yield* WishlistRepo;
    const getOwned = Effect.fn("WishlistAccess.getOwned")(function* (id: IdBranded<"wishlist">) {
      const { userId } = yield* CurrentUser;
      const wishlist = yield* repo.get(id);
      const owner = wishlist?.wishlistOwners.find((owner) => owner.userId === userId);
      if (!wishlist || !owner) return yield* WishlistNotFound.make({ wishlistId: id });
      return { ...wishlist, currentUserIsCreator: owner.role === "creator" };
    });
    return {
      getOwned,
      getPublic: Effect.fn("WishlistAccess.getPublic")(function* (id: IdBranded<"wishlist">) {
        const wishlist = yield* repo.get(id);
        if (!wishlist || wishlist.shareStatus !== "public") {
          return yield* WishlistNotFound.make({ wishlistId: id });
        }
        return wishlist;
      }),
      getShared: Effect.fn("WishlistAccess.getShared")(function* (id: IdBranded<"wishlist">) {
        const { userId } = yield* CurrentUser;
        const wishlist = yield* repo.get(id);
        if (
          !wishlist ||
          wishlist.wishlistOwners.some((owner) => owner.userId === userId) ||
          !(
            wishlist.shareStatus === "public" ||
            (wishlist.shareStatus === "shared" &&
              wishlist.wishlistSharedWith.some((member) => member.userId === userId))
          )
        ) {
          return yield* WishlistNotFound.make({ wishlistId: id });
        }
        return wishlist;
      }),
    };
  }),
}) {
  static readonly layer = Layer.effect(this, this.make);
}
