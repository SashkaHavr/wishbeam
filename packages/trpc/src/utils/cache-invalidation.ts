import z from 'zod';

import { publish } from '@wishbeam/pubsub';

export function getCacheInvalidationSubject(userId: string) {
  return `cache-invalidation.${userId}`;
}

const invalidationType = ['wishlists'] as const;

export const cacheInvalidationSchema = z.union([
  z.object({ type: z.enum(invalidationType) }),
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
