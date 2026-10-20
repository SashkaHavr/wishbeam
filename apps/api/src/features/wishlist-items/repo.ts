import { and, eq, notInArray } from "drizzle-orm";
import { Context, Effect, Layer } from "effect";

import type { ApiInput } from "@wishbeam/api-contract";
import { Database, schema } from "@wishbeam/db";
import type { IdBranded } from "@wishbeam/db/id-branded";

export class WishlistItemRepo extends Context.Service<WishlistItemRepo>()("api/WishlistItemRepo", {
  make: Effect.gen(function* () {
    const db = yield* Database;
    return {
      getAll: Effect.fnUntraced(function* (id: IdBranded<"wishlist">, activeOnly = false) {
        return yield* db.query.wishlistItem
          .findMany({
            where: {
              wishlistId: { eq: id },
              ...(activeOnly ? { status: { eq: "active" as const } } : {}),
            },
            orderBy: { order: "asc" },
          })
          .pipe(Effect.orDie);
      }),
      get: Effect.fnUntraced(function* (
        id: IdBranded<"wishlist">,
        itemId: IdBranded<"wishlist-item">,
      ) {
        return yield* db.query.wishlistItem
          .findFirst({ where: { id: { eq: itemId }, wishlistId: { eq: id } } })
          .pipe(Effect.orDie);
      }),
      create: Effect.fnUntraced(function* (
        id: IdBranded<"wishlist">,
        data: ApiInput["wishlistItems"]["create"]["payload"],
      ) {
        return yield* db
          .insert(schema.wishlistItem)
          .values({ ...data, wishlistId: id, links: [...data.links] })
          .returning()
          .pipe(Effect.orDie);
      }),
      update: Effect.fnUntraced(function* (
        itemId: IdBranded<"wishlist-item">,
        data: Partial<typeof schema.wishlistItem.$inferInsert>,
      ) {
        return yield* db
          .update(schema.wishlistItem)
          .set(data)
          .where(eq(schema.wishlistItem.id, itemId))
          .pipe(Effect.orDie);
      }),
      delete: Effect.fnUntraced(function* (itemId: IdBranded<"wishlist-item">) {
        return yield* db
          .delete(schema.wishlistItem)
          .where(eq(schema.wishlistItem.id, itemId))
          .pipe(Effect.orDie);
      }),
      clearLocks: Effect.fnUntraced(function* (id: IdBranded<"wishlist">) {
        return yield* db
          .update(schema.wishlistItem)
          .set({ lockedUserId: null, lockChangedAt: new Date() })
          .where(eq(schema.wishlistItem.wishlistId, id))
          .pipe(Effect.orDie);
      }),
      clearUserLocks: Effect.fnUntraced(function* (
        id: IdBranded<"wishlist">,
        userId: IdBranded<"user">,
      ) {
        return yield* db
          .update(schema.wishlistItem)
          .set({ lockedUserId: null, lockChangedAt: new Date() })
          .where(
            and(
              eq(schema.wishlistItem.wishlistId, id),
              eq(schema.wishlistItem.lockedUserId, userId),
            ),
          )
          .pipe(Effect.orDie);
      }),
      clearUnsharedLocks: Effect.fnUntraced(function* (
        id: IdBranded<"wishlist">,
        userIds: ReadonlyArray<IdBranded<"user">>,
      ) {
        return yield* db
          .update(schema.wishlistItem)
          .set({ lockedUserId: null, lockChangedAt: new Date() })
          .where(
            and(
              eq(schema.wishlistItem.wishlistId, id),
              notInArray(schema.wishlistItem.lockedUserId, [...userIds]),
            ),
          )
          .pipe(Effect.orDie);
      }),
    };
  }),
}) {
  static readonly layer = Layer.effect(this, this.make);
}
