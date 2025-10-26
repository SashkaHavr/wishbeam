import z from 'zod';

import { db } from '@wishbeam/db';
import { publish } from '@wishbeam/pubsub';

import { uuidv7ToBase62 } from './zod-utils';

export function getCacheInvalidationSubject(userId: string) {
  return `cache-invalidation.${userId}`;
}

export function getPublicCacheInvalidationSubject(wishlistId: string) {
  return `public-wishlist.${wishlistId}`;
}

export const cacheInvalidationSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal(['wishlists', 'locks']),
    wishlistId: uuidv7ToBase62,
  }),
]);

async function getUserIdsToNotify(
  data: z.infer<typeof cacheInvalidationSchema>,
): Promise<string[]> {
  switch (data.type) {
    case 'wishlists':
    case 'locks':
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
  currentUserId: string,
  data: z.infer<typeof cacheInvalidationSchema>,
) {
  const userIdsToNotify = (await getUserIdsToNotify(data)).filter(
    (id) => id !== currentUserId,
  );
  for (const userId of userIdsToNotify) {
    publish<z.infer<typeof cacheInvalidationSchema>>({
      subject: getCacheInvalidationSubject(userId),
      message: data,
    });
  }

  if (data.type === 'locks') {
    publish<z.infer<typeof cacheInvalidationSchema>>({
      subject: getPublicCacheInvalidationSubject(data.wishlistId),
      message: data,
    });
  }
}
