import z from "zod";

import { publicProcedure, router } from "#init.ts";
import { envAuth } from "@wishbeam/env/auth";

export const configRouter = router({
  general: publicProcedure
    .output(
      z.object({
        auth: z.object({ testAuth: z.boolean(), googleOAuth: z.boolean() }),
      }),
    )
    .query(() => {
      return {
        auth: {
          testAuth: envAuth.TEST_AUTH,
          googleOAuth: !!envAuth.GOOGLE_CLIENT_ID && !!envAuth.GOOGLE_CLIENT_SECRET,
        },
      };
    }),
});
