import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm/sql";

import { comicBooksTable } from "../tables/comicBooks.table.ts";
import { comicSeriesGroupsTable } from "../tables/comicSeriesGroups.table.ts";

export const comicBookSeriesGroupsTable = sqliteTable(
  "comic_book_series_groups",
  {
    id: int().primaryKey({ autoIncrement: true }),
    comicBookId: int().notNull().references(() => comicBooksTable.id, {
      onDelete: "cascade",
    }),
    comicSeriesGroupId: int().notNull().references(
      () => comicSeriesGroupsTable.id,
      { onDelete: "cascade" },
    ),
    createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  },
);
