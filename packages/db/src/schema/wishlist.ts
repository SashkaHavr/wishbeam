import { index, pgTable, text } from 'drizzle-orm/pg-core';

import { baseTable } from '#utils/base-table.ts';
import { oneToMany } from '#utils/foreign-keys.ts';
import { user } from './auth';

export const wishlist = pgTable('wishlist', {
  ...baseTable,
  title: text().notNull(),
  description: text().notNull(),
});

export const wishlistOwner = pgTable(
  'wishlist_owner',
  {
    ...baseTable,
    wishlistId: oneToMany(() => wishlist.id),
    userId: oneToMany(() => user.id),
  },
  (table) => [index().on(table.wishlistId), index().on(table.userId)],
);
