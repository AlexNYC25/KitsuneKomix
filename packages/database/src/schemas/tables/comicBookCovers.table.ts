import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm/sql";

import { comicPagesTable } from "./comicPages.table.ts";

export const comicBookCovers = sqliteTable("comic_book_covers", {
  id: int().primaryKey({ autoIncrement: true }),
  comicPageId: int().notNull().references(() => comicPagesTable.id, {
    onDelete: "cascade",
  }),
  filePath: text().notNull(),
  createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});