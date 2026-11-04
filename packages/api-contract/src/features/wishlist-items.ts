import { Schema } from "effect";
import { HttpApiEndpoint, HttpApiGroup } from "effect/http-api";

import { WishlistNotFound, WishlistParams } from "#/features/wishlists";
import { IdPublic } from "#/id-public";
import { AuthenticationMiddleware } from "#/middleware/authentication";

export class WishlistItemNotFound extends Schema.TaggedError<WishlistItemNotFound>()(
  "WishlistItemNotFound",
  { itemId: IdPublic("wishlist-item") },
  { httpApiStatus: 404 },
) {}
export class WishlistItemLockConflict extends Schema.TaggedError<WishlistItemLockConflict>()(
  "WishlistItemLockConflict",
  { itemId: IdPublic("wishlist-item") },
  { httpApiStatus: 409 },
) {}
const HttpUrl = Schema.String.check(
  Schema.makeFilter(
    (value) => {
      if (!URL.canParse(value)) return false;
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    },
    { expected: "a valid HTTP or HTTPS URL" },
  ),
);
export const EstimatedPrice = Schema.String.check(Schema.isMaxLength(50));
export const WishlistItemInput = Schema.Struct({
  title: Schema.Trim.check(Schema.isMinLength(1), Schema.isMaxLength(100)),
  description: Schema.Trim.check(Schema.isMaxLength(500)),
  links: Schema.Array(HttpUrl).check(Schema.isMaxLength(5)),
  estimatedPrice: Schema.NullOr(EstimatedPrice),
});
const WishlistItemOutputFields = {
  ...WishlistItemInput.fields,
  title: Schema.toEncoded(WishlistItemInput.fields.title),
  description: Schema.toEncoded(WishlistItemInput.fields.description),
};
export const ItemStatus = Schema.Literals(["active", "archived"]);
export const WishlistItemOutput = Schema.Struct({
  id: IdPublic("wishlist-item"),
  ...WishlistItemOutputFields,
  status: ItemStatus,
});
export const SharedWishlistItemOutput = Schema.Struct({
  id: IdPublic("wishlist-item"),
  ...WishlistItemOutputFields,
  lockStatus: Schema.Literals(["unlocked", "lockedByCurrentUser", "lockedByAnotherUser"]),
});
export const ItemParams = Schema.Struct({
  ...WishlistParams.fields,
  itemId: IdPublic("wishlist-item"),
});

export class WishlistItemsApi extends HttpApiGroup.make("wishlistItems")
  .add(
    HttpApiEndpoint.get("getAll", "/", {
      params: WishlistParams,
      success: Schema.Array(WishlistItemOutput),
      error: [WishlistNotFound],
    }),
    HttpApiEndpoint.get("getShared", "/shared", {
      params: WishlistParams,
      success: Schema.Array(SharedWishlistItemOutput),
      error: [WishlistNotFound],
    }),
    HttpApiEndpoint.post("create", "/", {
      params: WishlistParams,
      payload: WishlistItemInput,
      success: WishlistItemOutput,
      error: [WishlistNotFound],
    }),
    HttpApiEndpoint.patch("update", "/:itemId", {
      params: ItemParams,
      payload: WishlistItemInput,
      success: Schema.Null,
      error: [WishlistNotFound, WishlistItemNotFound],
    }),
    HttpApiEndpoint.delete("delete", "/:itemId", {
      params: ItemParams,
      success: Schema.Null,
      error: [WishlistNotFound, WishlistItemNotFound],
    }),
    HttpApiEndpoint.put("setStatus", "/:itemId/status", {
      params: ItemParams,
      payload: Schema.Struct({ status: ItemStatus }),
      success: Schema.Null,
      error: [WishlistNotFound, WishlistItemNotFound],
    }),
    HttpApiEndpoint.put("move", "/:itemId/order", {
      params: ItemParams,
      payload: Schema.Struct({ direction: Schema.Literals(["up", "down"]) }),
      success: Schema.Null,
      error: [WishlistNotFound, WishlistItemNotFound],
    }),
    HttpApiEndpoint.put("lock", "/:itemId/lock", {
      params: ItemParams,
      success: Schema.Null,
      error: [WishlistNotFound, WishlistItemNotFound, WishlistItemLockConflict],
    }),
    HttpApiEndpoint.delete("unlock", "/:itemId/lock", {
      params: ItemParams,
      success: Schema.Null,
      error: [WishlistNotFound, WishlistItemNotFound, WishlistItemLockConflict],
    }),
  )
  .middleware(AuthenticationMiddleware)
  .prefix("/wishlists/:id/items") {}

export class PublicWishlistItemsApi extends HttpApiGroup.make("publicWishlistItems")
  .add(
    HttpApiEndpoint.get("getAll", "/", {
      params: WishlistParams,
      success: Schema.Array(SharedWishlistItemOutput),
      error: [WishlistNotFound],
    }),
  )
  .prefix("/public/wishlists/:id/items") {}
