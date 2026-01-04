import { publicProcedure, router } from "#init.ts";
import { envServer } from "@wishbeam/env/server";
import z from "zod";

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
          testAuth: envServer.TEST_AUTH,
          googleOAuth: !!envServer.GOOGLE_CLIENT_ID && !!envServer.GOOGLE_CLIENT_SECRET,
        },
      };
    }),
});
