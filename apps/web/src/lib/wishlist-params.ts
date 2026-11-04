import { notFound } from "@tanstack/react-router";
import { Option, Schema } from "effect";

import { IdPublic } from "@wishbeam/api-contract/id-public";
import type { IdBranded } from "@wishbeam/db/id-branded";

const WishlistId = IdPublic("wishlist");
const decodeWishlistId = Schema.decodeOption(WishlistId);

export function parseWishlistParams(params: { id: string }) {
  const id = decodeWishlistId(params.id);
  if (Option.isNone(id)) throw notFound();
  return { id: id.value };
}

export function stringifyWishlistParams(params: { id: IdBranded<"wishlist"> }) {
  return { id: Schema.encodeSync(WishlistId)(params.id) };
}
