import { TRPCError } from "@trpc/server";
import z from "zod";

import { subscribe } from "@wishbeam/pubsub";

import { protectedProcedure, publicProcedure, router } from "#init.ts";
import {
  cacheInvalidationSchema,
  getCacheInvalidationChannel,
  getPublicCacheInvalidationChannel,
} from "#utils/cache-invalidation.ts";
import { base62ToUuidv7 } from "#utils/zod-utils.ts";

export const cacheRouter = router({
  invalidations: protectedProcedure.subscription(async function* ({
    ctx: { userId },
    signal: abortSignal,
  }) {
    if (!abortSignal) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Abort signal is required",
      });
    }
    for await (const message of subscribe({
      channel: getCacheInvalidationChannel(userId),
      abortSignal,
      schema: cacheInvalidationSchema,
    })) {
      yield message;
    }
  }),
  invalidationsPublic: publicProcedure
    .input(z.object({ wishlistId: base62ToUuidv7 }))
    .subscription(async function* ({ input, signal: abortSignal }) {
      if (!abortSignal) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Abort signal is required",
        });
      }
      for await (const message of subscribe({
        channel: getPublicCacheInvalidationChannel(input.wishlistId),
        abortSignal,
        schema: cacheInvalidationSchema,
      })) {
        yield message;
      }
    }),
});
