import { defineRelations } from 'drizzle-orm';

import * as schema from './schema';

export const relations = defineRelations(schema, (r) => ({
  wishlist: {
    wishlistOwners: r.many.wishlistOwner({
      from: r.wishlist.id,
      to: r.wishlistOwner.wishlistId,
    }),
  },
}));
