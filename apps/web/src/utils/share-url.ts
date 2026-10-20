import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { Schema } from "effect";

import { IdPublic } from "@wishbeam/api-contract/id-public";
import type { IdBranded } from "@wishbeam/db/id-branded";

const getOrigin = createIsomorphicFn()
  .server(() => new URL(getRequest().url).origin)
  .client(() => window.location.origin);

export function getWishlistShareUrl(id: IdBranded<"wishlist">) {
  return new URL(`/shared/${Schema.encodeSync(IdPublic("wishlist"))(id)}`, getOrigin()).href;
}
