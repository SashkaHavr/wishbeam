import { and, eq } from "drizzle-orm";
import { Context, Effect, Layer } from "effect";

import type { ApiInput } from "@wishbeam/api-contract";
import { CurrentUser } from "@wishbeam/api-contract/context";
import { Database, schema } from "@wishbeam/db";
import type { IdBranded } from "@wishbeam/db/id-branded";

type WishlistId = IdBranded<"wishlist">;
type UserId = IdBranded<"user">;

export class WishlistRepo extends Context.Service<WishlistRepo>()("api/WishlistRepo", {
  make: Effect.gen(function* () {
    const db = yield* Database;
    return {
      getAll: Effect.fnUntraced(function* () {
        const { userId } = yield* CurrentUser;
        return yield* db.query.wishlist
          .findMany({
            where: { wishlistOwners: { userId: { eq: userId } } },
            with: { wishlistOwners: true },
            orderBy: { createdAt: "asc" },
          })
          .pipe(Effect.orDie);
      }),
      getShared: Effect.fnUntraced(function* () {
        const { userId } = yield* CurrentUser;
        return yield* db.query.wishlist
          .findMany({
            where: {
              NOT: { wishlistOwners: { userId: { eq: userId } } },
              OR: [
                {
                  shareStatus: { eq: "public" },
                  OR: [
                    { wishlistPublicSaved: { userId: { eq: userId } } },
                    { wishlistSharedWith: { userId: { eq: userId } } },
                  ],
                },
                { shareStatus: { eq: "shared" }, wishlistSharedWith: { userId: { eq: userId } } },
              ],
            },
            orderBy: { createdAt: "asc" },
          })
          .pipe(Effect.orDie);
      }),
      get: Effect.fnUntraced(function* (id: WishlistId) {
        return yield* db.query.wishlist
          .findFirst({
            where: { id: { eq: id } },
            with: {
              wishlistOwners: true,
              wishlistSharedWith: true,
              wishlistPublicSaved: true,
            },
          })
          .pipe(Effect.orDie);
      }),
      lock: Effect.fnUntraced(function* (id: WishlistId) {
        return yield* db
          .select({ id: schema.wishlist.id })
          .from(schema.wishlist)
          .where(eq(schema.wishlist.id, id))
          .for("update")
          .pipe(Effect.orDie);
      }),
      create: Effect.fnUntraced(function* (data: ApiInput["wishlists"]["create"]["payload"]) {
        return yield* db.insert(schema.wishlist).values(data).returning().pipe(Effect.orDie);
      }),
      update: Effect.fnUntraced(function* (
        id: WishlistId,
        data: Partial<typeof schema.wishlist.$inferInsert>,
      ) {
        return yield* db
          .update(schema.wishlist)
          .set(data)
          .where(eq(schema.wishlist.id, id))
          .pipe(Effect.orDie);
      }),
      delete: Effect.fnUntraced(function* (id: WishlistId) {
        return yield* db
          .delete(schema.wishlist)
          .where(eq(schema.wishlist.id, id))
          .pipe(Effect.orDie);
      }),
      getOwners: Effect.fnUntraced(function* (id: WishlistId) {
        return yield* db
          .select({
            id: schema.user.id,
            email: schema.user.email,
            name: schema.user.name,
            role: schema.wishlistOwner.role,
          })
          .from(schema.wishlistOwner)
          .innerJoin(schema.user, eq(schema.user.id, schema.wishlistOwner.userId))
          .where(eq(schema.wishlistOwner.wishlistId, id))
          .pipe(Effect.orDie);
      }),
      getMembers: Effect.fnUntraced(function* (id: WishlistId) {
        return yield* db
          .select({ id: schema.user.id, email: schema.user.email, name: schema.user.name })
          .from(schema.wishlistUsersSharedWith)
          .innerJoin(schema.user, eq(schema.user.id, schema.wishlistUsersSharedWith.userId))
          .where(eq(schema.wishlistUsersSharedWith.wishlistId, id))
          .pipe(Effect.orDie);
      }),
      addOwner: Effect.fnUntraced(function* (
        id: WishlistId,
        userId: UserId,
        role: "creator" | "owner",
      ) {
        return yield* db
          .insert(schema.wishlistOwner)
          .values({ wishlistId: id, userId, role })
          .pipe(Effect.orDie);
      }),
      deleteOwner: Effect.fnUntraced(function* (id: WishlistId, userId: UserId) {
        return yield* db
          .delete(schema.wishlistOwner)
          .where(
            and(eq(schema.wishlistOwner.wishlistId, id), eq(schema.wishlistOwner.userId, userId)),
          )
          .pipe(Effect.orDie);
      }),
      addMember: Effect.fnUntraced(function* (id: WishlistId, userId: UserId) {
        return yield* db
          .insert(schema.wishlistUsersSharedWith)
          .values({ wishlistId: id, userId })
          .pipe(Effect.orDie);
      }),
      deleteMember: Effect.fnUntraced(function* (id: WishlistId, userId: UserId) {
        return yield* db
          .delete(schema.wishlistUsersSharedWith)
          .where(
            and(
              eq(schema.wishlistUsersSharedWith.wishlistId, id),
              eq(schema.wishlistUsersSharedWith.userId, userId),
            ),
          )
          .pipe(Effect.orDie);
      }),
      savePublic: Effect.fnUntraced(function* (id: WishlistId, userId: UserId) {
        return yield* db
          .insert(schema.wishlistPublicUsersSavedShare)
          .values({ wishlistId: id, userId })
          .onConflictDoNothing()
          .pipe(Effect.orDie);
      }),
      getUserByEmail: Effect.fnUntraced(function* (email: string) {
        return yield* db.query.user
          .findFirst({ where: { email: { eq: email } } })
          .pipe(Effect.orDie);
      }),
    };
  }),
}) {
  static readonly layer = Layer.effect(this, this.make);
}
