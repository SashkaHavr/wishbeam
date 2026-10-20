import { Schema } from "effect";
import { HttpApiEndpoint, HttpApiGroup, HttpApiSchema } from "effect/http-api";

import { WishlistNotFound, WishlistParams } from "#features/wishlists";
import { AuthenticationMiddleware } from "#middleware/authentication";

export const Invalidation = Schema.Struct({ type: Schema.Literal("wishlists") });

export class EventsApi extends HttpApiGroup.make("events")
  .add(
    HttpApiEndpoint.get("subscribe", "/", {
      success: HttpApiSchema.StreamSse({ data: Invalidation }),
    }),
  )
  .middleware(AuthenticationMiddleware)
  .prefix("/events") {}

export class PublicEventsApi extends HttpApiGroup.make("publicEvents")
  .add(
    HttpApiEndpoint.get("subscribe", "/:id", {
      params: WishlistParams,
      success: HttpApiSchema.StreamSse({ data: Invalidation }),
      error: [WishlistNotFound],
    }),
  )
  .prefix("/public/events") {}
