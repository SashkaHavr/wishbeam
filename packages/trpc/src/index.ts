import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

import { createContext } from '#context.ts';
import { createCallerFactory, publicProcedure, router } from '#init.ts';
import { cacheRouter } from '#routers/cache.ts';
import { configRouter } from '#routers/config.ts';
import { wishlistRouter } from '#routers/wishlist.ts';

const appRouter = router({
  health: publicProcedure.query(() => 'tRPC healthy!'),
  config: configRouter,
  wishlist: wishlistRouter,
  cache: cacheRouter,
});

export function trpcHandler({ request }: { request: Request }) {
  return fetchRequestHandler({
    req: request,
    router: appRouter,
    endpoint: '/trpc',
    createContext: (opts) => createContext({ request: opts.req }),
  });
}

export const createTrpcCaller = createCallerFactory(appRouter);

export type TRPCRouter = typeof appRouter;
export type TRPCInput = inferRouterInputs<TRPCRouter>;
export type TRPCOutput = inferRouterOutputs<TRPCRouter>;
