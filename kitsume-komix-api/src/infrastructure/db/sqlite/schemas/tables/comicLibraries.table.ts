import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm/sql";

export const comicLibrariesTable = sqliteTable("comic_libraries", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  path: text().notNull(),
  description: text(),
  enabled: int().notNull().default(1),
  changedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});