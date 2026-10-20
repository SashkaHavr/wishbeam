import { Effect } from "effect";
import { HttpApiBuilder } from "effect/http-api";

import { Api } from "@wishbeam/api-contract";
import { CurrentUser } from "@wishbeam/api-contract/context";

import { WishlistAccess } from "../wishlists/service";
import { WishlistEvents } from "./service";

export const EventsApiLive = HttpApiBuilder.group(
  Api,
  "events",
  Effect.fn(function* (handlers) {
    const events = yield* WishlistEvents;
    return handlers.handleAll({
      subscribe: Effect.fnUntraced(function* () {
        const { userId } = yield* CurrentUser;
        return events.subscribe((event) => event.userIds.includes(userId));
      }),
    });
  }),
);

export const PublicEventsApiLive = HttpApiBuilder.group(
  Api,
  "publicEvents",
  Effect.fn(function* (handlers) {
    const events = yield* WishlistEvents;
    const access = yield* WishlistAccess;
    return handlers.handleAll({
      subscribe: Effect.fnUntraced(function* ({ params }) {
        yield* access.getPublic(params.id);
        return events.subscribe((event) => event.wishlistId === params.id);
      }),
    });
  }),
);
