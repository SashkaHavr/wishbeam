import type z from "zod";

import { RedisClient } from "bun";
import { on } from "events";

import { envPubSub } from "@wishbeam/env/pubsub";

const subscriber = new RedisClient(envPubSub.REDIS_URL);
const publisher = await subscriber.duplicate();

export async function* subscribe<Output>({
  channel,
  abortSignal,
  schema,
}: {
  channel: string;
  abortSignal: AbortSignal;
  schema: z.ZodType<Output>;
}) {
  const ee = new EventTarget();
  try {
    await subscriber.subscribe(channel, (message) => {
      ee.dispatchEvent(new MessageEvent("message", { data: message }));
    });
    for await (const [event] of on(ee, "message", { signal: abortSignal })) {
      if (event instanceof MessageEvent) {
        yield schema.parse(JSON.parse(event.data as string));
      }
    }
  } catch {
    await subscriber.unsubscribe(channel);
  }
}

export async function publish<T>({ channel, message }: { channel: string; message: T }) {
  await publisher.publish(channel, JSON.stringify(message));
}
