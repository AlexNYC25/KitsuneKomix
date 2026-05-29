import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm/sql";

import { comicBooksTable } from "../tables/comicBooks.table.ts";
import { comicPencilersTable } from "../tables/comicPencilers.table.ts";

export const comicBookPencilersTable = sqliteTable("comic_book_pencilers", {
  id: int().primaryKey({ autoIncrement: true }),
  comicBookId: int().notNull().references(() => comicBooksTable.id, {
    onDelete: "cascade",
  }),
  comicPencilerId: int().notNull().references(
    () => comicPencilersTable.id,
    { onDelete: "cascade" },
  ),
  createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});