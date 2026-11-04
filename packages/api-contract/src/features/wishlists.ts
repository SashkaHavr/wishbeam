import { Schema } from "effect";
import { HttpApiEndpoint, HttpApiGroup } from "effect/http-api";

import { IdPublic } from "#/id-public";
import { AuthenticationMiddleware } from "#/middleware/authentication";
import { IdBranded } from "@wishbeam/db/id-branded";

export class WishlistNotFound extends Schema.TaggedError<WishlistNotFound>()(
  "WishlistNotFound",
  { wishlistId: IdPublic("wishlist") },
  { httpApiStatus: 404 },
) {}
export class WishlistCreatorRequired extends Schema.TaggedError<WishlistCreatorRequired>()(
  "WishlistCreatorRequired",
  { wishlistId: IdPublic("wishlist") },
  { httpApiStatus: 403 },
) {}
export class WishlistMemberConflict extends Schema.TaggedError<WishlistMemberConflict>()(
  "WishlistMemberConflict",
  { userId: IdBranded("user") },
  { httpApiStatus: 409 },
) {}
export class WishlistUserNotFound extends Schema.TaggedError<WishlistUserNotFound>()(
  "WishlistUserNotFound",
  { email: Schema.String },
  { httpApiStatus: 404 },
) {}

export const WishlistInput = Schema.Struct({
  title: Schema.Trim.check(Schema.isMaxLength(100), Schema.isMinLength(1)),
  description: Schema.Trim.check(Schema.isMaxLength(500)),
});
const WishlistOutputFields = {
  title: Schema.toEncoded(WishlistInput.fields.title),
  description: Schema.toEncoded(WishlistInput.fields.description),
};
export const ShareStatus = Schema.Literals(["private", "shared", "public"]);
export const WishlistOutput = Schema.Struct({
  id: IdPublic("wishlist"),
  ...WishlistOutputFields,
  shareStatus: ShareStatus,
  currentUserIsCreator: Schema.Boolean,
});
export const SharedWishlistOutput = Schema.Struct({
  id: IdPublic("wishlist"),
  ...WishlistOutputFields,
});
export const MemberOutput = Schema.Struct({
  id: IdBranded("user"),
  email: Schema.String,
  name: Schema.String,
});
export const OwnerOutput = Schema.Struct({
  ...MemberOutput.fields,
  role: Schema.Literals(["creator", "owner"]),
});
export const WishlistParams = Schema.Struct({ id: IdPublic("wishlist") });
export const WishlistMemberParams = Schema.Struct({
  ...WishlistParams.fields,
  userId: IdBranded("user"),
});
export const MemberInput = Schema.Struct({
  email: Schema.String.check(Schema.isPattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)),
});

export class WishlistsApi extends HttpApiGroup.make("wishlists")
  .add(
    HttpApiEndpoint.get("getAll", "/", { success: Schema.Array(WishlistOutput) }),
    HttpApiEndpoint.get("getShared", "/shared", { success: Schema.Array(SharedWishlistOutput) }),
    HttpApiEndpoint.get("isOwned", "/:id/owned", {
      params: WishlistParams,
      success: Schema.Boolean,
    }),
    HttpApiEndpoint.get("get", "/:id", {
      params: WishlistParams,
      success: WishlistOutput,
      error: [WishlistNotFound],
    }),
    HttpApiEndpoint.get("getSharedById", "/:id/shared", {
      params: WishlistParams,
      success: SharedWishlistOutput,
      error: [WishlistNotFound],
    }),
    HttpApiEndpoint.post("create", "/", { payload: WishlistInput, success: WishlistOutput }),
    HttpApiEndpoint.patch("update", "/:id", {
      params: WishlistParams,
      payload: WishlistInput,
      success: Schema.Null,
      error: [WishlistNotFound],
    }),
    HttpApiEndpoint.delete("delete", "/:id", {
      params: WishlistParams,
      success: Schema.Null,
      error: [WishlistNotFound],
    }),
    HttpApiEndpoint.put("setShareStatus", "/:id/sharing", {
      params: WishlistParams,
      payload: Schema.Struct({ shareStatus: ShareStatus }),
      success: Schema.Null,
      error: [WishlistNotFound],
    }),
    HttpApiEndpoint.get("getOwners", "/:id/owners", {
      params: WishlistParams,
      success: Schema.Array(OwnerOutput),
      error: [WishlistNotFound, WishlistCreatorRequired],
    }),
    HttpApiEndpoint.post("addOwner", "/:id/owners", {
      params: WishlistParams,
      payload: MemberInput,
      success: Schema.Null,
      error: [
        WishlistNotFound,
        WishlistCreatorRequired,
        WishlistUserNotFound,
        WishlistMemberConflict,
      ],
    }),
    HttpApiEndpoint.delete("deleteOwner", "/:id/owners/:userId", {
      params: WishlistMemberParams,
      success: Schema.Null,
      error: [WishlistNotFound, WishlistCreatorRequired, WishlistMemberConflict],
    }),
    HttpApiEndpoint.get("getMembers", "/:id/members", {
      params: WishlistParams,
      success: Schema.Array(MemberOutput),
      error: [WishlistNotFound],
    }),
    HttpApiEndpoint.post("addMember", "/:id/members", {
      params: WishlistParams,
      payload: MemberInput,
      success: Schema.Null,
      error: [WishlistNotFound, WishlistUserNotFound, WishlistMemberConflict],
    }),
    HttpApiEndpoint.delete("deleteMember", "/:id/members/:userId", {
      params: WishlistMemberParams,
      success: Schema.Null,
      error: [WishlistNotFound, WishlistMemberConflict],
    }),
  )
  .middleware(AuthenticationMiddleware)
  .prefix("/wishlists") {}

export class PublicWishlistsApi extends HttpApiGroup.make("publicWishlists")
  .add(
    HttpApiEndpoint.get("get", "/:id", {
      params: WishlistParams,
      success: SharedWishlistOutput,
      error: [WishlistNotFound],
    }),
  )
  .prefix("/public/wishlists") {}
