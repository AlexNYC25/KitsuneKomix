import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm/sql";

import { comicSeriesTable } from "../tables/comicSeries.table.ts";
import { comicTeamsTable } from "../tables/comicTeams.table.ts";

export const comicSeriesTeamsTable = sqliteTable("comic_series_teams", {
  id: int().primaryKey({ autoIncrement: true }),
  comicSeriesId: int().notNull().references(() => comicSeriesTable.id, {
    onDelete: "cascade",
  }),
  comicTeamId: int().notNull().references(() => comicTeamsTable.id, {
    onDelete: "cascade",
  }),
  createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});