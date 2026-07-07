import { int, snakeCase, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm/sql";

// TODO: check if the changedAt field is unnecessary since we have the updatedAt
export const comicLibrariesTable = snakeCase.table("comic_libraries", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  path: text().notNull().unique(),
  description: text(),
  enabled: int({mode: "boolean"}).notNull().default(true),
  changedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});