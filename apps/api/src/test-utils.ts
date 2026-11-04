import { Effect, FileSystem, Layer, Path, References } from "effect";
import { Etag, HttpPlatform } from "effect/http";

import { CurrentUser } from "@wishbeam/api-contract/context";
import { GlobalMiddleware } from "@wishbeam/api-contract/middleware/global";
import type { SessionType } from "@wishbeam/auth";
import { Auth } from "@wishbeam/auth/service";
import { Database, schema } from "@wishbeam/db";
import { IdBranded } from "@wishbeam/db/id-branded";
import type { IdBrandInput, SchemaIdBrands } from "@wishbeam/db/id-branded";
import { StructuredLogger } from "@wishbeam/services/structured-logger";

export function testId<T extends SchemaIdBrands>(schema: IdBrandInput<T>, id: number) {
  const idString = id.toString();
  return IdBranded<T>(schema).make(
    "00000000-0000-7000-8000-000000000000".slice(0, -idString.length) + idString,
  );
}

export const seedUsers = Effect.gen(function* () {
  const db = yield* Database;
  yield* db.delete(schema.user);
  yield* db.insert(schema.user).values([
    { id: testId("user", 0), name: "Test User", email: "test@example.com" },
    { id: testId("user", 1), name: "Other User", email: "other@example.com" },
  ]);
});

export function layerCurrentUser(id?: number) {
  return Layer.succeed(CurrentUser, {
    userId: testId("user", id ?? 0),
    session: {} as SessionType,
  });
}

export function layerAuth(id?: number) {
  return Layer.succeed(Auth)({
    getSession: () =>
      Effect.succeed(id !== undefined ? { user: { id: testId("user", id) } } : null),
  } as unknown as Auth["Service"]);
}

export const ClientDependenciesLayerTest = Layer.empty.pipe(
  Layer.provideMerge(Path.layer),
  Layer.provideMerge(Etag.layerWeak),
  Layer.provideMerge(HttpPlatform.layer),
  Layer.provideMerge(FileSystem.layerNoop({})),
  Layer.provideMerge(Layer.succeed(GlobalMiddleware)(GlobalMiddleware.of((effect) => effect))),
  Layer.provideMerge(StructuredLogger.layer),
  Layer.provide(Layer.succeed(References.MinimumLogLevel, "None")),
);
