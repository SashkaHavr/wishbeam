import { createServerFileRoute } from '@tanstack/react-start/server';

import { auth } from '@wishbeam/auth';

export const ServerRoute = createServerFileRoute('/auth/$').methods({
  GET: async ({ request }) => {
    return auth.handler(request);
  },
  POST: async ({ request }) => {
    return auth.handler(request);
  },
});
