import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm/sql";

import { comicLibrariesTable } from "../tables/comicLibraries.table.ts";
import { comicSeriesTable } from "../tables/comicSeries.table.ts";

export const comicLibrariesSeriesTable = sqliteTable("comic_libraries_series", {
  id: int().primaryKey({ autoIncrement: true }),
  libraryId: int().notNull().references(() => comicLibrariesTable.id, {
    onDelete: "cascade",
  }),
  comicSeriesId: int().notNull().references(() => comicSeriesTable.id, {
    onDelete: "cascade",
  }),
  createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});