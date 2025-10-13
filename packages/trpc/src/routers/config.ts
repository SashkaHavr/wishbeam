import z from 'zod';

import { envServer } from '@wishbeam/env/server';

import { publicProcedure, router } from '#init.ts';

export const configRouter = router({
  authConfig: publicProcedure
    .output(z.object({ testAuth: z.boolean(), google: z.boolean() }))
    .query(() => {
      return {
        testAuth: envServer.TEST_AUTH,
        google:
          envServer.GOOGLE_CLIENT_ID !== undefined &&
          envServer.GOOGLE_CLIENT_SECRET !== undefined,
      };
    }),
});
