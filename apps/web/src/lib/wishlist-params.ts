import { Schema } from "effect";

import { IdPublic } from "@wishbeam/api-contract/id-public";
import type { IdBranded } from "@wishbeam/db/id-branded";

const WishlistId = IdPublic("wishlist");

export function parseWishlistParams(params: { id: string }) {
  return { id: Schema.decodeSync(WishlistId)(params.id) };
}

export function stringifyWishlistParams(params: { id: IdBranded<"wishlist"> }) {
  return { id: Schema.encodeSync(WishlistId)(params.id) };
}
