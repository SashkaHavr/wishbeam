import { sql } from 'drizzle-orm';
import { index, pgEnum, pgTable, text } from 'drizzle-orm/pg-core';

import { baseTable } from '#utils/base-table.ts';
import { oneToMany, oneToManyCascadeOnDelete } from '#utils/foreign-keys.ts';
import { user } from './auth';

export const wishlist = pgTable('wishlist', {
  ...baseTable,
  title: text().notNull(),
  description: text().notNull(),
});

export const wishlistOwnerRole = pgEnum('wishlist_owner_role', [
  'owner',
  'creator',
]);

export const wishlistOwner = pgTable(
  'wishlist_owner',
  {
    ...baseTable,
    wishlistId: oneToMany(() => wishlist.id),
    userId: oneToMany(() => user.id),
    role: wishlistOwnerRole().notNull(),
  },
  (table) => [index().on(table.wishlistId), index().on(table.userId)],
);

export const wishlistItem = pgTable('wishlist_item', {
  ...baseTable,
  wishlistId: oneToManyCascadeOnDelete(() => wishlist.id),
  title: text().notNull(),
  description: text().notNull(),
  links: text()
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  // approximatePrice: integer(),
  // quantity: integer().notNull().default(1),
});
