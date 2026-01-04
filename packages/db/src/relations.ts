import { defineRelations } from "drizzle-orm";

import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  wishlist: {
    wishlistOwners: r.many.wishlistOwner({
      from: r.wishlist.id,
      to: r.wishlistOwner.wishlistId,
    }),
    wishlistItems: r.many.wishlistItem({
      from: r.wishlist.id,
      to: r.wishlistItem.wishlistId,
    }),
    wishlistSharedWith: r.many.wishlistUsersSharedWith({
      from: r.wishlist.id,
      to: r.wishlistUsersSharedWith.wishlistId,
    }),
    wishlistPublicSaved: r.many.wishlistPublicUsersSavedShare({
      from: r.wishlist.id,
      to: r.wishlistPublicUsersSavedShare.wishlistId,
    }),
  },
  wishlistOwner: {
    wishlist: r.one.wishlist({ optional: false }),
    user: r.one.user({
      from: r.wishlistOwner.userId,
      to: r.user.id,
      optional: false,
    }),
  },
  wishlistUsersSharedWith: {
    user: r.one.user({
      from: r.wishlistUsersSharedWith.userId,
      to: r.user.id,
      optional: false,
    }),
  },
  wishlistItem: {
    wishlist: r.one.wishlist({ optional: false }),
  },
}));
