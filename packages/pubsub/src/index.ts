import { on } from "events";

import { RedisClient } from "bun";
import type { ZodType } from "zod";

import { envPubSub } from "@wishbeam/env/pubsub";

const redis = new RedisClient(envPubSub.REDIS_URL);
await redis.connect();
const publisher = await redis.duplicate();

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

  const subscriber = await redis.duplicate();
  const events = new EventTarget();
  const listener = (message: string) => {
    events.dispatchEvent(new MessageEvent("message", { data: message }));
  };

  try {
    await subscriber.subscribe(channel, listener);

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
    await Promise.allSettled([subscriber.unsubscribe(channel, listener)]);
    subscriber.close();
  }
}

export async function publish<T>({ channel, message }: { channel: string; message: T }) {
  await publisher.publish(channel, JSON.stringify(message));
}

export async function ping() {
  await redis.ping();
  await publisher.ping();
}
