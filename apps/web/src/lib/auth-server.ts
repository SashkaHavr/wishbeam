import { createMiddleware, createServerFn } from '@tanstack/react-start';
import { getWebRequest } from '@tanstack/react-start/server';

import { auth } from '@wishbeam/auth';

import { trpcServerFnMiddleware } from './trpc-server';

export const authServerFnMiddleware = createMiddleware({
  type: 'function',
}).server(({ next }) => {
  return next({
    context: {
      auth: auth.api,
      headers: getWebRequest().headers,
    },
  });
});

export const getAuthConfigServerFn = createServerFn()
  .middleware([trpcServerFnMiddleware])
  .handler(async ({ context: { trpc } }) => {
    return trpc.config.authConfig();
  });

export const getSessionServerFn = createServerFn()
  .middleware([authServerFnMiddleware])
  .handler(async ({ context: { auth, headers } }) => {
    const session = await auth.getSession({ headers });
    return session ? { session: session.session, user: session.user } : null;
  });
