import { Effect, Layer } from "effect";

import { CurrentUser } from "@wishbeam/api-contract/context";
import {
  AuthenticationMiddleware,
  NotAuthenticated,
} from "@wishbeam/api-contract/middleware/authentication";
import { Auth } from "@wishbeam/auth/service";
import { IdBranded } from "@wishbeam/db/id-branded";
import { StructuredLogger } from "@wishbeam/services/structured-logger";

const UserId = IdBranded("user");

export const AuthenticationMiddlewareLive = Layer.effect(
  AuthenticationMiddleware,
  Effect.gen(function* () {
    const auth = yield* Auth;
    const log = yield* StructuredLogger;

    return AuthenticationMiddleware.of((effect) =>
      Effect.gen(function* () {
        const session = yield* auth.getSession();
        if (!session) {
          return yield* NotAuthenticated.make();
        }

        yield* log.set({ user: { id: session.user.id, roles: session.user.role } });
        return yield* Effect.provideService(effect, CurrentUser, {
          session,
          userId: UserId.make(session.user.id),
        });
      }),
    );
  }),
);
