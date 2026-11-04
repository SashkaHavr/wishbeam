import { Effect } from "effect";
import { HttpApiBuilder } from "effect/http-api";

import { Api } from "@wishbeam/api-contract";
import { CurrentUser } from "@wishbeam/api-contract/context";
import {
  WishlistItemNotFound,
  WishlistItemLockConflict,
} from "@wishbeam/api-contract/features/wishlist-items";
import { Database } from "@wishbeam/db";
import type { IdBranded } from "@wishbeam/db/id-branded";

import { WishlistEvents } from "../events/service";
import { WishlistRepo } from "../wishlists/repo";
import { WishlistAccess } from "../wishlists/service";
import { WishlistItemRepo } from "./repo";

export const WishlistItemsApiLive = HttpApiBuilder.group(
  Api,
  "wishlistItems",
  Effect.fn(function* (handlers) {
    const db = yield* Database;
    const repo = yield* WishlistItemRepo;
    const wishlists = yield* WishlistRepo;
    const access = yield* WishlistAccess;
    const events = yield* WishlistEvents;

    const getItem = Effect.fnUntraced(function* (
      id: IdBranded<"wishlist">,
      itemId: IdBranded<"wishlist-item">,
    ) {
      const item = yield* repo.get(id, itemId);
      if (!item) return yield* WishlistItemNotFound.make({ itemId });
      return item;
    });
    const mutate = <A, E, R>(
      id: IdBranded<"wishlist">,
      shared: boolean,
      action: () => Effect.Effect<A, E, R>,
    ) =>
      Effect.gen(function* () {
        const { userId } = yield* CurrentUser;
        const { result, userIds } = yield* db
          .transaction(
            Effect.fn(function* () {
              yield* wishlists.lock(id);
              const wishlist = yield* shared ? access.getShared(id) : access.getOwned(id);
              const result = yield* action();
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
      getAll: Effect.fnUntraced(function* ({ params }) {
        yield* access.getOwned(params.id);
        return yield* repo.getAll(params.id);
      }),
      getShared: Effect.fnUntraced(function* ({ params }) {
        const { userId } = yield* CurrentUser;
        yield* access.getShared(params.id);
        return (yield* repo.getAll(params.id, true)).map((item) => ({
          ...item,
          lockStatus:
            item.lockedUserId === null
              ? ("unlocked" as const)
              : item.lockedUserId === userId
                ? ("lockedByCurrentUser" as const)
                : ("lockedByAnotherUser" as const),
        }));
      }),
      create: Effect.fnUntraced(function* ({ params, payload }) {
        return yield* mutate(
          params.id,
          false,
          Effect.fnUntraced(function* () {
            const [item] = yield* repo.create(params.id, payload);
            if (!item) return yield* Effect.die("Failed to create wishlist item");
            return item;
          }),
        );
      }),
      update: Effect.fnUntraced(function* ({ params, payload }) {
        yield* mutate(
          params.id,
          false,
          Effect.fnUntraced(function* () {
            yield* getItem(params.id, params.itemId);
            yield* repo.update(params.itemId, { ...payload, links: [...payload.links] });
          }),
        );
        return null;
      }),
      delete: Effect.fnUntraced(function* ({ params }) {
        yield* mutate(
          params.id,
          false,
          Effect.fnUntraced(function* () {
            yield* getItem(params.id, params.itemId);
            yield* repo.delete(params.itemId);
          }),
        );
        return null;
      }),
      setStatus: Effect.fnUntraced(function* ({ params, payload }) {
        yield* mutate(
          params.id,
          false,
          Effect.fnUntraced(function* () {
            yield* getItem(params.id, params.itemId);
            yield* repo.update(params.itemId, {
              status: payload.status,
              lockedUserId: null,
              lockChangedAt: new Date(),
            });
          }),
        );
        return null;
      }),
      move: Effect.fnUntraced(function* ({ params, payload }) {
        yield* mutate(
          params.id,
          false,
          Effect.fnUntraced(function* () {
            const item = yield* getItem(params.id, params.itemId);
            const items = yield* repo.getAll(params.id);
            const index = items.findIndex((current) => current.id === item.id);
            const other = items[index + (payload.direction === "up" ? -1 : 1)];
            if (!other) return;
            yield* repo.update(item.id, { order: other.order });
            yield* repo.update(other.id, { order: item.order });
          }),
        );
        return null;
      }),
      lock: Effect.fnUntraced(function* ({ params }) {
        const { userId } = yield* CurrentUser;
        yield* mutate(
          params.id,
          true,
          Effect.fnUntraced(function* () {
            const item = yield* getItem(params.id, params.itemId);
            if (item.status !== "active") {
              return yield* WishlistItemNotFound.make({ itemId: item.id });
            }
            if (item.lockedUserId !== null) {
              return yield* WishlistItemLockConflict.make({ itemId: item.id });
            }
            yield* repo.update(item.id, { lockedUserId: userId, lockChangedAt: new Date() });
          }),
        );
        return null;
      }),
      unlock: Effect.fnUntraced(function* ({ params }) {
        const { userId } = yield* CurrentUser;
        yield* mutate(
          params.id,
          true,
          Effect.fnUntraced(function* () {
            const item = yield* getItem(params.id, params.itemId);
            if (item.status !== "active") {
              return yield* WishlistItemNotFound.make({ itemId: item.id });
            }
            if (item.lockedUserId !== userId) {
              return yield* WishlistItemLockConflict.make({ itemId: item.id });
            }
            yield* repo.update(item.id, { lockedUserId: null, lockChangedAt: new Date() });
          }),
        );
        return null;
      }),
    });
  }),
);

export const PublicWishlistItemsApiLive = HttpApiBuilder.group(
  Api,
  "publicWishlistItems",
  Effect.fn(function* (handlers) {
    const access = yield* WishlistAccess;
    const repo = yield* WishlistItemRepo;
    return handlers.handleAll({
      getAll: Effect.fnUntraced(function* ({ params }) {
        yield* access.getPublic(params.id);
        return (yield* repo.getAll(params.id, true)).map((item) => ({
          ...item,
          lockStatus:
            item.lockedUserId === null ? ("unlocked" as const) : ("lockedByAnotherUser" as const),
        }));
      }),
    });
  }),
);
