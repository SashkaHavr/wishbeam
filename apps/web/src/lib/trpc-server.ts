import { createMiddleware, createServerFn } from '@tanstack/react-start';
import { getWebRequest } from '@tanstack/react-start/server';
import z from 'zod';

import { createTrpcCaller } from '@wishbeam/trpc';

export const trpcServerFnMiddleware = createMiddleware({
  type: 'function',
}).server(({ next }) => {
  return next({
    context: {
      trpc: createTrpcCaller({ request: getWebRequest() }),
    },
  });
});

export const wishlistsGetOwnedServerFn = createServerFn()
  .middleware([trpcServerFnMiddleware])
  .handler(async ({ context }) => {
    return context.trpc.ownedWishlist.getAll();
  });

export const wishlistGetByIdServerFn = createServerFn()
  .middleware([trpcServerFnMiddleware])
  .validator(z.object({ id: z.string() }))
  .handler(async ({ context, data }) => {
    return context.trpc.ownedWishlist.getById(data);
  });
