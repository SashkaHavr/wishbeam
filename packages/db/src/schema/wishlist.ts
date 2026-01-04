import { sql } from "drizzle-orm";
import { index, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { baseTable } from "#utils/base-table.ts";
import { oneToMany, oneToManyCascadeOnDelete, oneToManyNullable } from "#utils/foreign-keys.ts";
import { user } from "./auth";

export const wishlistShareStatus = pgEnum("wishlist_share_status", ["private", "shared", "public"]);

export const wishlistStatus = pgEnum("wishlist_status", ["active", "archived"]);

export const wishlist = pgTable("wishlist", {
  ...baseTable,
  title: text().notNull(),
  description: text().notNull(),
  shareStatus: wishlistShareStatus().notNull().default("private"),
});

export const wishlistOwnerRole = pgEnum("wishlist_owner_role", ["owner", "creator"]);

export const wishlistOwner = pgTable(
  "wishlist_owner",
  {
    ...baseTable,
    wishlistId: oneToMany(() => wishlist.id),
    userId: oneToMany(() => user.id),
    role: wishlistOwnerRole().notNull(),
  },
  (table) => [index().on(table.wishlistId), index().on(table.userId)],
);

export const wishlistItem = pgTable(
  "wishlist_item",
  {
    ...baseTable,
    wishlistId: oneToManyCascadeOnDelete(() => wishlist.id),
    title: text().notNull(),
    description: text().notNull(),
    links: text()
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    status: wishlistStatus().notNull().default("active"),
    estimatedPrice: text(),
    lockedUserId: oneToManyNullable(() => user.id),
    lockChangedAt: timestamp().notNull().defaultNow(),
  },
  (table) => [index().on(table.wishlistId)],
);

export const wishlistUsersSharedWith = pgTable(
  "wishlist_users_shared_with",
  {
    ...baseTable,
    wishlistId: oneToManyCascadeOnDelete(() => wishlist.id),
    userId: oneToManyCascadeOnDelete(() => user.id),
  },
  (table) => [index().on(table.wishlistId), index().on(table.userId)],
);

export const wishlistPublicUsersSavedShare = pgTable(
  "wishlist_public_users_saved_share",
  {
    ...baseTable,
    wishlistId: oneToManyCascadeOnDelete(() => wishlist.id),
    userId: oneToManyCascadeOnDelete(() => user.id),
  },
  (table) => [index().on(table.wishlistId), index().on(table.userId)],
);
