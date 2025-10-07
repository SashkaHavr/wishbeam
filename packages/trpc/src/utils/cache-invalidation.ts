import z from 'zod';

import { db } from '@wishbeam/db';
import { publish } from '@wishbeam/pubsub';

export function getCacheInvalidationSubject(userId: string) {
  return `cache-invalidation.${userId}`;
}

export const cacheInvalidationSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal(['wishlists']),
    wishlistId: z.string(),
  }),
]);

async function getUserIdsToNotify(
  data: z.infer<typeof cacheInvalidationSchema>,
): Promise<string[]> {
  switch (data.type) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    case 'wishlists':
      return (
        await db.query.wishlistOwner.findMany({
          columns: { userId: true },
          where: { wishlistId: data.wishlistId },
        })
      ).map((o) => o.userId);
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
}
