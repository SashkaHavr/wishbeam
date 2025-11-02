import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

import { createContext } from '#context.ts';
import { createCallerFactory, publicProcedure, router } from '#init.ts';
import { cacheRouter } from '#routers/cache.ts';
import { configRouter } from '#routers/config.ts';
import { ownedWishlistsRouter } from '#routers/wishlists.owned.ts';
import { publicWishlistsRouter } from '#routers/wishlists.public.ts';
import { sharedWishlistsRouter } from '#routers/wishlists.shared.ts';
import { urlMetaRouter } from '#routers/wishlists.url-meta.ts';

const appRouter = router({
  health: publicProcedure.query(() => 'tRPC healthy!'),
  config: configRouter,
  cache: cacheRouter,
  wishlists: router({
    owned: ownedWishlistsRouter,
    public: publicWishlistsRouter,
    shared: sharedWishlistsRouter,
    urlMeta: urlMetaRouter,
  }),
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
