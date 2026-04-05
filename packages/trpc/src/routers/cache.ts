import { TRPCError } from "@trpc/server";
import z from "zod";

import { publicProcedure, router } from "#init.ts";
import { protectedProcedure } from "#procedures/protected-procedure.ts";
import {
  cacheInvalidationSchema,
  getCacheInvalidationChannel,
  getPublicCacheInvalidationChannel,
} from "#utils/cache-invalidation.ts";
import { base62ToUuidv7 } from "#utils/zod-utils.ts";
import { subscribe } from "@wishbeam/pubsub";

function getSubscriptionAbortSignal(abortSignal?: AbortSignal) {
  if (!abortSignal) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Abort signal is required",
    });
  }

  return abortSignal;
}

async function* subscribeToCacheInvalidations({
  channel,
  abortSignal,
}: {
  channel: string;
  abortSignal?: AbortSignal;
}): AsyncGenerator<z.infer<typeof cacheInvalidationSchema>, void, unknown> {
  yield* subscribe({
    channel,
    abortSignal: getSubscriptionAbortSignal(abortSignal),
    schema: cacheInvalidationSchema,
  });
}

export const cacheRouter = router({
  invalidations: protectedProcedure.subscription(({ ctx: { userId }, signal: abortSignal }) => {
    return subscribeToCacheInvalidations({
      channel: getCacheInvalidationChannel(userId),
      abortSignal,
    });
  }),
  invalidationsPublic: publicProcedure
    .input(z.object({ wishlistId: base62ToUuidv7 }))
    .subscription(({ input, signal: abortSignal }) => {
      return subscribeToCacheInvalidations({
        channel: getPublicCacheInvalidationChannel(input.wishlistId),
        abortSignal,
      });
    }),
});
