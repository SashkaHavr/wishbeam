import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const envRedis = createEnv({
  server: {
    REDIS_URL: z.string(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
