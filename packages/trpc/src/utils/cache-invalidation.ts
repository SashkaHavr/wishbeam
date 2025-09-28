import z from 'zod';

import { publish } from '@wishbeam/pubsub';

export function getCacheInvalidationSubject(userId: string) {
  return `cache-invalidation.${userId}`;
}

export const cacheInvalidationSchema = z.union([
  z.object({ type: z.literal('wishlists') }),
  z.object({ type: z.literal('wishlist-data'), wishlistId: z.string() }),
]);

export function invalidateCache(
  userId: string,
  data: z.infer<typeof cacheInvalidationSchema>,
) {
  publish({
    subject: getCacheInvalidationSubject(userId),
    message: data,
  });
}
