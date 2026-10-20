import { Effect, Layer } from "effect";
import { HttpApiBuilder } from "effect/http-api";

import { Api } from "@wishbeam/api-contract";
import { CurrentUser } from "@wishbeam/api-contract/context";
import {
  WishlistCreatorRequired,
  WishlistMemberConflict,
  WishlistUserNotFound,
} from "@wishbeam/api-contract/features/wishlists";
import { Database } from "@wishbeam/db";
import type { IdBranded } from "@wishbeam/db/id-branded";

import { WishlistEvents } from "../events/service";
import { WishlistItemRepo } from "../wishlist-items/repo";
import { WishlistRepo } from "./repo";
import { WishlistAccess } from "./service";

export const WishlistsApiLive = HttpApiBuilder.group(
  Api,
  "wishlists",
  Effect.fn(function* (handlers) {
    const db = yield* Database;
    const repo = yield* WishlistRepo;
    const items = yield* WishlistItemRepo;
    const access = yield* WishlistAccess;
    const events = yield* WishlistEvents;
    type Owned = Effect.Success<ReturnType<typeof access.getOwned>>;

    const requireCreator = Effect.fnUntraced(function* (wishlist: Owned) {
      if (!wishlist.currentUserIsCreator) {
        return yield* WishlistCreatorRequired.make({ wishlistId: wishlist.id });
      }
    });
    const mutate = <A, E, R>(
      id: IdBranded<"wishlist">,
      action: (wishlist: Owned) => Effect.Effect<A, E, R>,
    ) =>
      Effect.gen(function* () {
        const { userId } = yield* CurrentUser;
        const { result, userIds } = yield* db
          .transaction(
            Effect.fn(function* () {
              yield* repo.lock(id);
              const wishlist = yield* access.getOwned(id);
              const result = yield* action(wishlist);
              return {
                result,
                userIds: [
                  userId,
                  ...wishlist.wishlistOwners.map((owner) => owner.userId),
                  ...wishlist.wishlistSharedWith.map((member) => member.userId),
                  ...wishlist.wishlistPublicSaved.map((saved) => saved.userId),
                ],
              };
            }),
          )
          .pipe(Effect.catchTag("SqlError", Effect.die));
        yield* events.publish(id, userIds);
        return result;
      });

    return handlers.handleAll({
      getAll: Effect.fnUntraced(function* () {
        const { userId } = yield* CurrentUser;
        return (yield* repo.getAll()).map((wishlist) => ({
          ...wishlist,
          currentUserIsCreator: wishlist.wishlistOwners.some(
            (owner) => owner.userId === userId && owner.role === "creator",
          ),
        }));
      }),
      getShared: Effect.fnUntraced(function* () {
        return yield* repo.getShared();
      }),
      isOwned: Effect.fnUntraced(function* ({ params }) {
        const { userId } = yield* CurrentUser;
        return (
          (yield* repo.get(params.id))?.wishlistOwners.some((owner) => owner.userId === userId) ??
          false
        );
      }),
      get: Effect.fnUntraced(function* ({ params }) {
        return yield* access.getOwned(params.id);
      }),
      getSharedById: Effect.fnUntraced(function* ({ params }) {
        const { userId } = yield* CurrentUser;
        return yield* db
          .transaction(
            Effect.fn(function* () {
              yield* repo.lock(params.id);
              const wishlist = yield* access.getShared(params.id);
              if (wishlist.shareStatus === "public") yield* repo.savePublic(params.id, userId);
              return wishlist;
            }),
          )
          .pipe(Effect.catchTag("SqlError", Effect.die));
      }),
      create: Effect.fnUntraced(function* ({ payload }) {
        const { userId } = yield* CurrentUser;
        const wishlist = yield* db
          .transaction(
            Effect.fn(function* () {
              const [wishlist] = yield* repo.create(payload);
              if (!wishlist) return yield* Effect.die("Failed to create wishlist");
              yield* repo.addOwner(wishlist.id, userId, "creator");
              return wishlist;
            }),
          )
          .pipe(Effect.catchTag("SqlError", Effect.die));
        yield* events.publish(wishlist.id, [userId]);
        return { ...wishlist, currentUserIsCreator: true };
      }),
      update: Effect.fnUntraced(function* ({ params, payload }) {
        yield* mutate(
          params.id,
          Effect.fnUntraced(function* () {
            yield* repo.update(params.id, payload);
          }),
        );
        return null;
      }),
      delete: Effect.fnUntraced(function* ({ params }) {
        const { userId } = yield* CurrentUser;
        yield* mutate(
          params.id,
          Effect.fnUntraced(function* (wishlist) {
            if (wishlist.currentUserIsCreator) yield* repo.delete(params.id);
            else yield* repo.deleteOwner(params.id, userId);
          }),
        );
        return null;
      }),
      setShareStatus: Effect.fnUntraced(function* ({ params, payload }) {
        yield* mutate(
          params.id,
          Effect.fnUntraced(function* (wishlist) {
            yield* repo.update(params.id, payload);
            if (payload.shareStatus === "private") yield* items.clearLocks(params.id);
            if (payload.shareStatus === "shared") {
              yield* items.clearUnsharedLocks(
                params.id,
                wishlist.wishlistSharedWith.map((member) => member.userId),
              );
            }
          }),
        );
        return null;
      }),
      getOwners: Effect.fnUntraced(function* ({ params }) {
        yield* requireCreator(yield* access.getOwned(params.id));
        return yield* repo.getOwners(params.id);
      }),
      getMembers: Effect.fnUntraced(function* ({ params }) {
        yield* access.getOwned(params.id);
        return yield* repo.getMembers(params.id);
      }),
      addOwner: Effect.fnUntraced(function* ({ params, payload }) {
        const newUserId = yield* mutate(
          params.id,
          Effect.fnUntraced(function* (wishlist) {
            yield* requireCreator(wishlist);
            const user = yield* repo.getUserByEmail(payload.email);
            if (!user) return yield* WishlistUserNotFound.make({ email: payload.email });
            if (wishlist.wishlistOwners.some((owner) => owner.userId === user.id)) {
              return yield* WishlistMemberConflict.make({ userId: user.id });
            }
            yield* repo.addOwner(params.id, user.id, "owner");
            yield* items.clearUserLocks(params.id, user.id);
            return user.id;
          }),
        );
        yield* events.publish(params.id, [newUserId]);
        return null;
      }),
      deleteOwner: Effect.fnUntraced(function* ({ params }) {
        yield* mutate(
          params.id,
          Effect.fnUntraced(function* (wishlist) {
            yield* requireCreator(wishlist);
            if (
              wishlist.wishlistOwners.some(
                (owner) => owner.userId === params.userId && owner.role === "creator",
              )
            ) {
              return yield* WishlistMemberConflict.make({ userId: params.userId });
            }
            yield* repo.deleteOwner(params.id, params.userId);
          }),
        );
        return null;
      }),
      addMember: Effect.fnUntraced(function* ({ params, payload }) {
        const newUserId = yield* mutate(
          params.id,
          Effect.fnUntraced(function* (wishlist) {
            const user = yield* repo.getUserByEmail(payload.email);
            if (!user) return yield* WishlistUserNotFound.make({ email: payload.email });
            if (
              wishlist.wishlistOwners.some((owner) => owner.userId === user.id) ||
              wishlist.wishlistSharedWith.some((member) => member.userId === user.id)
            ) {
              return yield* WishlistMemberConflict.make({ userId: user.id });
            }
            yield* repo.addMember(params.id, user.id);
            return user.id;
          }),
        );
        yield* events.publish(params.id, [newUserId]);
        return null;
      }),
      deleteMember: Effect.fnUntraced(function* ({ params }) {
        yield* mutate(
          params.id,
          Effect.fnUntraced(function* (wishlist) {
            yield* repo.deleteMember(params.id, params.userId);
            if (wishlist.shareStatus === "shared") {
              yield* items.clearUserLocks(params.id, params.userId);
            }
          }),
        );
        return null;
      }),
    });
  }),
);

export const PublicWishlistsApiLive = HttpApiBuilder.group(
  Api,
  "publicWishlists",
  Effect.fn(function* (handlers) {
    const access = yield* WishlistAccess;
    return handlers.handleAll({
      get: Effect.fnUntraced(function* ({ params }) {
        return yield* access.getPublic(params.id);
      }),
    });
  }),
);

export const WishlistServices = Layer.mergeAll(WishlistAccess.layer, WishlistItemRepo.layer).pipe(
  Layer.provideMerge(WishlistRepo.layer),
);
