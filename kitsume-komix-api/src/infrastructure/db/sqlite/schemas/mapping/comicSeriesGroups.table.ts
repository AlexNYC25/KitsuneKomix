import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm/sql";

import { comicSeriesTable } from "../tables/comicSeries.table.ts";
import { comicSeriesGroupsTable } from "../tables/comicSeriesGroups.table.ts";

export const comicSeriesSeriesGroupsTable = sqliteTable(
  "comic_series_series_groups",
  {
    id: int().primaryKey({ autoIncrement: true }),
    comicSeriesId: int().notNull().references(() => comicSeriesTable.id, {
      onDelete: "cascade",
    }),
    comicSeriesGroupId: int().notNull().references(
      () => comicSeriesGroupsTable.id,
      { onDelete: "cascade" },
    ),
    position: int().notNull(),
    createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  },
);