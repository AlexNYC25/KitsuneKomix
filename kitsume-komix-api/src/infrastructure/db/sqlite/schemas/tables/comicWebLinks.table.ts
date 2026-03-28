import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm/sql";

import { comicBooksTable } from "./comicBooks.table.ts";

export const comicWebLinksTable = sqliteTable("comic_web_links", {
  id: int().primaryKey({ autoIncrement: true }),
  comicBookId: int().notNull().references(() => comicBooksTable.id, {
    onDelete: "cascade",
  }),
  url: text().notNull().unique(),
  description: text(),
  createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});