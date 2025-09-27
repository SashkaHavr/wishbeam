import { TRPCError } from '@trpc/server';

import { subscribe } from '@wishbeam/pubsub';

import { protectedProcedure, router } from '#init.ts';
import {
  cacheInvalidationSchema,
  getCacheInvalidationSubject,
} from '#utils/cache-invalidation.ts';

export const cacheRouter = router({
  invalidations: protectedProcedure.subscription(async function* ({
    ctx: { userId },
    signal: abortSignal,
  }) {
    if (!abortSignal) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Abort signal is required',
      });
    }
    for await (const message of subscribe({
      subject: getCacheInvalidationSubject(userId),
      abortSignal,
      schema: cacheInvalidationSchema,
    })) {
      yield message;
    }
  }),
});
