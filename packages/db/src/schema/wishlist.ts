import { sql } from "drizzle-orm";
import {
  index,
  integer,
  pgEnum,
  snakeCase,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { baseTable } from "#utils/base-table";
import { oneToManyCascadeOnDelete, oneToManyNullable } from "#utils/foreign-keys";

import { user } from "./auth";

export const wishlistShareStatus = pgEnum("wishlist_share_status", ["private", "shared", "public"]);

export const wishlistStatus = pgEnum("wishlist_status", ["active", "archived"]);

export const wishlist = snakeCase.table("wishlist", {
  ...baseTable<"wishlist">(),
  title: text().notNull(),
  description: text().notNull(),
  shareStatus: wishlistShareStatus().notNull().default("private"),
});

export const wishlistOwnerRole = pgEnum("wishlist_owner_role", ["owner", "creator"]);

export const wishlistOwner = snakeCase.table(
  "wishlist_owner",
  {
    ...baseTable<"wishlist-owner">(),
    wishlistId: oneToManyCascadeOnDelete(() => wishlist.id),
    userId: oneToManyCascadeOnDelete(() => user.id),
    role: wishlistOwnerRole().notNull(),
  },
  (table) => [uniqueIndex().on(table.wishlistId, table.userId), index().on(table.userId)],
);

export const wishlistItem = snakeCase.table(
  "wishlist_item",
  {
    ...baseTable<"wishlist-item">(),
    wishlistId: oneToManyCascadeOnDelete(() => wishlist.id),
    order: integer().generatedByDefaultAsIdentity().notNull(),
    title: text().notNull(),
    description: text().notNull(),
    links: text()
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    status: wishlistStatus().notNull().default("active"),
    estimatedPrice: text(),
    lockedUserId: oneToManyNullable(() => user.id),
    lockChangedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index().on(table.wishlistId)],
);

export const wishlistUsersSharedWith = snakeCase.table(
  "wishlist_users_shared_with",
  {
    ...baseTable<"wishlist-users-shared-with">(),
    wishlistId: oneToManyCascadeOnDelete(() => wishlist.id),
    userId: oneToManyCascadeOnDelete(() => user.id),
  },
  (table) => [uniqueIndex().on(table.wishlistId, table.userId), index().on(table.userId)],
);

export const wishlistPublicUsersSavedShare = snakeCase.table(
  "wishlist_public_users_saved_share",
  {
    ...baseTable<"wishlist-public-users-saved-share">(),
    wishlistId: oneToManyCascadeOnDelete(() => wishlist.id),
    userId: oneToManyCascadeOnDelete(() => user.id),
  },
  (table) => [uniqueIndex().on(table.wishlistId, table.userId), index().on(table.userId)],
);
