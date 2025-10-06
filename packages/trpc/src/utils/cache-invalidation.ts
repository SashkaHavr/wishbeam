import z from 'zod';

import { publish } from '@wishbeam/pubsub';

export function getCacheInvalidationSubject(userId: string) {
  return `cache-invalidation.${userId}`;
}

export const cacheInvalidationSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('wishlists.getAll') }),
  z.object({
    type: z.literal('wishlists.getById'),
    wishlistId: z.string(),
  }),
  z.object({ type: z.literal('wishlists.getItems'), wishlistId: z.string() }),
  z.object({
    type: z.literal('wishlists.getItemById'),
    wishlistItemId: z.string(),
  }),
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
