import { Array as Arr, Context, Effect, Layer, PubSub, Schedule, Schema, Stream } from "effect";

import { IdBranded } from "@wishbeam/db/id-branded";

import { EventsRepo } from "./repo";

const Notification = Schema.Struct({
  wishlistId: IdBranded("wishlist"),
  userIds: Schema.Array(IdBranded("user")),
});
const NotificationJson = Schema.fromJsonString(Notification);

export class WishlistEvents extends Context.Service<WishlistEvents>()("api/WishlistEvents", {
  make: Effect.gen(function* () {
    const repo = yield* EventsRepo;
    const events = yield* PubSub.sliding<typeof Notification.Type>(256);
    yield* Effect.addFinalizer(() => PubSub.shutdown(events));
    const listen = Stream.unwrap(Effect.map(repo.listen(), Stream.fromQueue)).pipe(
      Stream.mapEffect((notification) =>
        Schema.decodeEffect(NotificationJson)(notification.payload),
      ),
      Stream.retry(Schedule.spaced("1 second")),
    );
    yield* listen.pipe(
      Stream.runForEach((event) => PubSub.publish(events, event)),
      Effect.forkScoped,
    );

    return {
      publish: Effect.fn("WishlistEvents.publish")(function* (
        wishlistId: IdBranded<"wishlist">,
        userIds: ReadonlyArray<IdBranded<"user">>,
      ) {
        // Stay well below PostgreSQL's 8 KB notification payload limit.
        const batches = Arr.chunksOf([...new Set(userIds)], 50);
        for (const batch of batches.length > 0 ? batches : [[]]) {
          const payload = yield* Schema.encodeEffect(NotificationJson)({
            wishlistId,
            userIds: batch,
          });
          yield* repo.notify(payload);
        }
      }, Effect.orDie),
      subscribe: (filter: (event: typeof Notification.Type) => boolean) =>
        Stream.fromPubSub(events).pipe(
          Stream.filter(filter),
          Stream.map(() => ({ type: "wishlists" as const })),
          // Reconcile after reconnects and missed notifications; LISTEN/NOTIFY is not durable.
          Stream.merge(
            Stream.tick("30 seconds").pipe(Stream.map(() => ({ type: "wishlists" as const }))),
          ),
          Stream.merge(Stream.make({ type: "wishlists" as const })),
        ),
    };
  }),
}) {
  static readonly layer = Layer.effect(this, this.make).pipe(Layer.provide(EventsRepo.layer));
}
