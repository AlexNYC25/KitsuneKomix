import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm/sql";

import { comicBooksTable } from "../tables/comicBooks.table.ts";
import { comicPublishersTable } from "../tables/comicPublishers.table.ts";

export const comicBookPublishersTable = sqliteTable("comic_book_publishers", {
  id: int().primaryKey({ autoIncrement: true }),
  comicBookId: int().notNull().references(() => comicBooksTable.id, {
    onDelete: "cascade",
  }),
  comicPublisherId: int().notNull().references(
    () => comicPublishersTable.id,
    { onDelete: "cascade" },
  ),
  createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});