import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm/sql";

import { comicSeriesTable } from "../tables/comicSeries.table.ts";
import { comicPublishersTable } from "../tables/comicPublishers.table.ts";

export const comicSeriesPublishersTable = sqliteTable("comic_series_publishers", {
  id: int().primaryKey({ autoIncrement: true }),
  comicSeriesId: int().notNull().references(() => comicSeriesTable.id, {
    onDelete: "cascade",
  }),
  comicPublisherId: int().notNull().references(
    () => comicPublishersTable.id,
    { onDelete: "cascade" },
  ),
  createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});