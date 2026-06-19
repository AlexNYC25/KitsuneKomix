import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm/sql";

export const comicColoristsTable = sqliteTable("comic_colorists", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull().unique(),
  description: text(),
  createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});