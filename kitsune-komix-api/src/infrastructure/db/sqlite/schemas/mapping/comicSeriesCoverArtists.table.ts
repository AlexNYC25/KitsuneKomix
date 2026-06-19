import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm/sql";

import { comicSeriesTable } from "../tables/comicSeries.table.ts";
import { comicCoverArtistsTable } from "../tables/comicCoverArtists.table.ts";

export const comicSeriesCoverArtistsTable = sqliteTable(
  "comic_series_cover_artists",
  {
    id: int().primaryKey({ autoIncrement: true }),
    comicSeriesId: int().notNull().references(() => comicSeriesTable.id, {
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