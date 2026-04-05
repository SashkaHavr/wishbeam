import { unstable_localLink } from "@trpc/client";
import { TRPCError } from "@trpc/server";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { Result } from "better-result";
import { sql } from "drizzle-orm";
import superjson from "superjson";
import z from "zod";

import { createContext } from "#context.ts";
import { createCallerFactory, publicProcedure, router } from "#init.ts";
import { cacheRouter } from "#routers/cache.ts";
import { configRouter } from "#routers/config.ts";
import { ownedWishlistsRouter } from "#routers/wishlists.owned.ts";
import { publicWishlistsRouter } from "#routers/wishlists.public.ts";
import { sharedWishlistsRouter } from "#routers/wishlists.shared.ts";
import { ping as pingPubSub } from "@wishbeam/pubsub";

const appRouter = router({
  health: publicProcedure.output(z.null()).query(async ({ ctx }) => {
    const res = await Promise.all([
      Result.tryPromise(async () => await ctx.db.execute(sql`select 1`)),
      Result.tryPromise(async () => await pingPubSub()),
    ]);
    if (res[0].isErr()) {
      throw new TRPCError({
        message: "Healthcheck: DB connection failed",
        code: "INTERNAL_SERVER_ERROR",
        cause: res[0].error,
      });
    }
    if (res[1].isErr()) {
      throw new TRPCError({
        message: "Healthcheck: Redis connection failed",
        code: "INTERNAL_SERVER_ERROR",
        cause: res[1].error,
      });
    }
    return null;
  }),
  config: configRouter,
  cache: cacheRouter,
  wishlists: router({
    owned: ownedWishlistsRouter,
    public: publicWishlistsRouter,
    shared: sharedWishlistsRouter,
  }),
});

export async function trpcHandler({ request }: { request: Request }) {
  return await fetchRequestHandler({
    req: request,
    router: appRouter,
    endpoint: "/trpc",
    createContext: (opts) => createContext({ request: opts.req }),
  });
}

export const createTrpcCaller = createCallerFactory(appRouter);

export function createLocalLink({ request }: { request: Request }) {
  return unstable_localLink({
    router: appRouter,
    // oxlint-disable-next-line require-await
    createContext: async () => {
      // Create your context here
      return createContext({ request });
    },
    transformer: superjson,
  });
}

export type TRPCRouter = typeof appRouter;
export type TRPCInput = inferRouterInputs<TRPCRouter>;
export type TRPCOutput = inferRouterOutputs<TRPCRouter>;
