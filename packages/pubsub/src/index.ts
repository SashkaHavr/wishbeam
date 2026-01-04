import EventEmitter, { on } from "events";
import type z from "zod";
import { RedisClient } from "bun";

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
  schema: z.ZodSchema<Output>;
}) {
  const ee = new EventEmitter();
  try {
    await subscriber.subscribe(channel, (message) => {
      ee.emit("message", message);
    });
    for await (const [event] of on(ee, "message", { signal: abortSignal })) {
      yield schema.parse(JSON.parse(event as string));
    }
  } catch {
    await subscriber.unsubscribe(channel);
  }
}

export async function publish<T>({ channel, message }: { channel: string; message: T }) {
  await publisher.publish(channel, JSON.stringify(message));
}
