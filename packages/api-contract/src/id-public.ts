import basex from "base-x";
import { Effect, Schema, SchemaIssue, SchemaTransformation } from "effect";
import { parse, stringify } from "uuid";

import { IdBranded } from "@wishbeam/db/id-branded";
import type { IdBrandInput, SchemaIdBrands } from "@wishbeam/db/id-branded";

const base62 = basex("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ");
const PublicUuid = Schema.String.check(Schema.isPattern(/^[0-9a-zA-Z]{16,22}$/)).pipe(
  Schema.decodeTo(
    Schema.String.check(Schema.isUUID(7)),
    SchemaTransformation.transformEffect({
      decode: (value) =>
        Effect.try({
          try: () => stringify(base62.decode(value)),
          catch: () => new SchemaIssue.InvalidValue({ message: "Invalid public ID" }),
        }),
      encode: (value) => Effect.succeed(base62.encode(parse(value))),
    }),
  ),
);

export function IdPublic<T extends SchemaIdBrands>(brand: IdBrandInput<T>) {
  return PublicUuid.pipe(Schema.decodeTo(IdBranded<T>(brand)));
}
