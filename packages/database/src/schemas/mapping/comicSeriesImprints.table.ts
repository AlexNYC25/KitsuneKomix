import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm/sql";

import { comicSeriesTable } from "../tables/comicSeries.table.ts";
import { comicImprintsTable } from "../tables/comicImprints.table.ts";

export const comicSeriesImprintsTable = sqliteTable("comic_series_imprints", {
  id: int().primaryKey({ autoIncrement: true }),
  comicSeriesId: int().notNull().references(() => comicSeriesTable.id, {
    onDelete: "cascade",
  }),
  comicImprintId: int().notNull().references(() => comicImprintsTable.id, {
    onDelete: "cascade",
  }),
  createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});