import { on } from "events";

import type { ZodType } from "zod";

import { envPubSub } from "@wishbeam/env/pubsub";

function isAbortError(error: unknown) {
  return error instanceof Error && error.name === "AbortError";
}

export async function* subscribe<Output>({
  channel,
  abortSignal,
  schema,
}: {
  channel: string;
  abortSignal: AbortSignal;
  schema: ZodType<Output>;
}) {
  if (abortSignal.aborted) {
    return;
  }

  const events = new EventTarget();
  const listener = (message: string) => {
    events.dispatchEvent(new MessageEvent("message", { data: message }));
  };

  const redis = new Bun.RedisClient(envPubSub.REDIS_URL);
  try {
    await redis.subscribe(channel, listener);

    for await (const [event] of on(events, "message", { signal: abortSignal })) {
      if (!(event instanceof MessageEvent)) {
        continue;
      }

      yield schema.parse(JSON.parse(String(event.data)));
    }
  } catch (error) {
    if (!isAbortError(error)) {
      throw error;
    }
  } finally {
    await Promise.allSettled([redis.unsubscribe(channel, listener)]);
    redis.close();
  }
}

export async function publish<T>({ channel, message }: { channel: string; message: T }) {
  const redis = new Bun.RedisClient(envPubSub.REDIS_URL);
  try {
    await redis.publish(channel, JSON.stringify(message));
  } finally {
    redis.close();
  }
}

export async function ping() {
  const redis = new Bun.RedisClient(envPubSub.REDIS_URL);
  try {
    await redis.ping();
  } finally {
    redis.close();
  }
}
