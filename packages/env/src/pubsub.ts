import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const pubsubConfig = {
  PUBSUB_URL: z.string(),
};

export const envPubSub = createEnv({
  server: { ...pubsubConfig },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
