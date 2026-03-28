import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm/sql";

import { comicBooksTable } from "../tables/comicBooks.table.ts";
import { comicCharactersTable } from "../tables/comicCharacters.table.ts";

export const comicBookCharactersTable = sqliteTable("comic_book_characters", {
  id: int().primaryKey({ autoIncrement: true }),
  comicBookId: int().notNull().references(() => comicBooksTable.id, {
    onDelete: "cascade",
  }),
  comicCharacterId: int().notNull().references(
    () => comicCharactersTable.id,
    { onDelete: "cascade" },
  ),
  createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});