import { Effect, Layer, Option } from "effect";
import { HttpApiBuilder } from "effect/http-api";

import { Api } from "@wishbeam/api-contract";
import { NotReady } from "@wishbeam/api-contract/features/config";
import { AuthConfig } from "@wishbeam/config/auth";

import { ConfigRepo } from "./repo";

export const ConfigApiLive = HttpApiBuilder.group(
  Api,
  "config",
  Effect.fn(function* (handlers) {
    const config = yield* AuthConfig;
    const repo = yield* ConfigRepo;

    return handlers.handleAll({
      auth: Effect.fnUntraced(function* () {
        return yield* Effect.succeed({
          googleEmulate: Option.isSome(config.googleEmulateUrl),
        });
      }),
      healthLive: Effect.fnUntraced(function* () {
        return yield* Effect.succeed(null);
      }),
      healthReady: Effect.fnUntraced(function* () {
        if (!(yield* repo.healthcheck())) {
          return yield* NotReady.make();
        }
        return null;
      }),
    });
  }),
);

export const ConfigApiLiveWithServices = ConfigApiLive.pipe(Layer.provideMerge(ConfigRepo.layer));
