import { int, snakeCase, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm/sql";

import { comicSeriesTable } from "../tables/comicSeries.table.ts";
import { comicStoryArcsTable } from "../tables/comicStoryArcs.table.ts";

export const comicSeriesStoryArcsAggregateTable = snakeCase.table("comic_series_story_arcs", {
  id: int().primaryKey({ autoIncrement: true }),
  comicSeriesId: int().notNull().references(() => comicSeriesTable.id, {
    onDelete: "cascade",
  }),
  comicStoryArcId: int().notNull().references(() => comicStoryArcsTable.id, {
    onDelete: "cascade",
  }),
  position: int().notNull(),
  createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});