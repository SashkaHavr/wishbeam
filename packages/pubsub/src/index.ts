import type z from 'zod';
import { connect } from '@nats-io/transport-node';

import { envPubSub } from '@wishbeam/env/pubsub';

const nc = await connect({ servers: envPubSub.PUBSUB_URL });

export async function* subscribe<Output>({
  subject,
  abortSignal,
  schema,
}: {
  subject: string;
  abortSignal: AbortSignal;
  schema: z.ZodSchema<Output>;
}) {
  const sub = nc.subscribe(subject);
  abortSignal.onabort = () => sub.unsubscribe();
  for await (const m of sub) {
    yield schema.parse(m.json());
  }
}

export function publish<T>({
  subject,
  message,
}: {
  subject: string;
  message: T;
}) {
  nc.publish(subject, JSON.stringify(message));
}
