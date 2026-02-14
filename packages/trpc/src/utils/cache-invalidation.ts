import z from "zod";

import type { db as dbType } from "@wishbeam/db";

import { publish } from "@wishbeam/pubsub";

import { uuidv7ToBase62 } from "./zod-utils";

export function getCacheInvalidationChannel(userId: string) {
  const base62UserId = uuidv7ToBase62.parse(userId);
  return `cache-invalidation:${base62UserId}`;
}

export function getPublicCacheInvalidationChannel(wishlistId: string) {
  const base62WishlistId = uuidv7ToBase62.parse(wishlistId);
  return `public-wishlist:${base62WishlistId}`;
}

export const cacheInvalidationSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal(["wishlists"]),
    wishlistId: uuidv7ToBase62,
  }),
]);

async function getUserIdsToNotify(
  db: typeof dbType,
  data: z.infer<typeof cacheInvalidationSchema>,
): Promise<string[]> {
  switch (data.type) {
    case "wishlists":
      return (
        await Promise.all([
          db.query.wishlistOwner.findMany({
            columns: { userId: true },
            where: { wishlistId: data.wishlistId },
          }),
          db.query.wishlistPublicUsersSavedShare.findMany({
            columns: { userId: true },
            where: { wishlistId: data.wishlistId },
          }),
          db.query.wishlistUsersSharedWith.findMany({
            columns: { userId: true },
            where: { wishlistId: data.wishlistId },
          }),
        ])
      )
        .flat()
        .map((o) => o.userId);
  }
}

export async function invalidateCache(
  db: typeof dbType,
  currentUserId: string,
  data: z.infer<typeof cacheInvalidationSchema>,
) {
  const userIdsToNotify = (await getUserIdsToNotify(db, data)).filter((id) => id !== currentUserId);
  await Promise.all(
    userIdsToNotify.map(
      async (userId) =>
        await publish<z.infer<typeof cacheInvalidationSchema>>({
          channel: getCacheInvalidationChannel(userId),
          message: data,
        }),
    ),
  );

  await publish<z.infer<typeof cacheInvalidationSchema>>({
    channel: getPublicCacheInvalidationChannel(data.wishlistId),
    message: data,
  });
}
