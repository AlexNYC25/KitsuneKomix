import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm/sql";

import { comicBooksTable } from "../tables/comicBooks.table.ts";
import { comicCoverArtistsTable } from "../tables/comicCoverArtists.table.ts";

export const comicBookCoverArtistsTable = sqliteTable(
  "comic_book_cover_artists",
  {
    id: int().primaryKey({ autoIncrement: true }),
    comicBookId: int().notNull().references(() => comicBooksTable.id, {
      onDelete: "cascade",
    }),
    comicCoverArtistId: int().notNull().references(
      () => comicCoverArtistsTable.id,
      { onDelete: "cascade" },
    ),
    createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  },
);