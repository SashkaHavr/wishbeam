import type { pgTable } from 'drizzle-orm/pg-core';
import { uuid } from 'drizzle-orm/pg-core';

import type { baseTable } from './base-table';

type ForeignKeyColumn = ReturnType<
  typeof pgTable<string, typeof baseTable>
>['id'];

export function foreignKeyCascadeOnDelete(column: () => ForeignKeyColumn) {
  return uuid().notNull().references(column, { onDelete: 'cascade' });
}

export function foreignKeyRestrictDelete(column: () => ForeignKeyColumn) {
  return uuid().notNull().references(column, { onDelete: 'restrict' });
}

export function foreignKeyNullable(column: () => ForeignKeyColumn) {
  return uuid().references(column, { onDelete: 'set null' });
}

export function foreignKeyOneToOne(column: () => ForeignKeyColumn) {
  return uuid().notNull().unique().references(column, { onDelete: 'cascade' });
}
