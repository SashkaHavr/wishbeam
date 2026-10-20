import { PgClient } from "@effect/sql-pg";
import { Context, Effect, Layer } from "effect";

import { DBConfig } from "@wishbeam/config/db";

const channel = "wishbeam_invalidations";

export class EventsRepo extends Context.Service<EventsRepo>()("api/EventsRepo", {
  make: Effect.gen(function* () {
    const config = yield* DBConfig;
    const context = yield* PgClient.layer({ url: config.databaseUrl, maxConnections: 3 }).pipe(
      Layer.build,
    );
    const pg = Context.get(context, PgClient.PgClient);
    return {
      listen: Effect.fnUntraced(function* () {
        return yield* pg.listen(channel);
      }),
      notify: Effect.fnUntraced(function* (payload: string) {
        return yield* pg.notify(channel, payload);
      }),
    };
  }),
}) {
  static readonly layer = Layer.effect(this, this.make).pipe(Layer.provide(DBConfig.layer));
}
