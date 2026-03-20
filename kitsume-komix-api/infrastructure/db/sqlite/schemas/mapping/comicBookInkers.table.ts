import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm/sql";

import { comicBooksTable } from "../tables/comicBooks.table.ts";
import { comicInkersTable } from "../tables/comicInkers.table.ts";

export const comicBookInkersTable = sqliteTable("comic_book_inkers", {
  id: int().primaryKey({ autoIncrement: true }),
  comicBookId: int().notNull().references(() => comicBooksTable.id, {
    onDelete: "cascade",
  }),
  comicInkerId: int().notNull().references(() => comicInkersTable.id, {
    onDelete: "cascade",
  }),
  createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});