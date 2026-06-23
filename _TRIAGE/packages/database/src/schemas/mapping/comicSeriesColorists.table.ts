import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm/sql";

import { comicSeriesTable } from "../tables/comicSeries.table.ts";
import { comicColoristsTable } from "../tables/comicColorists.table.ts";

export const comicSeriesColoristsTable = sqliteTable("comic_series_colorists", {
  id: int().primaryKey({ autoIncrement: true }),
  comicSeriesId: int().notNull().references(() => comicSeriesTable.id, {
    onDelete: "cascade",
  }),
  comicCharacterId: int().notNull().references(
    () => comicColoristsTable.id,
    { onDelete: "cascade" },
  ),
  createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});