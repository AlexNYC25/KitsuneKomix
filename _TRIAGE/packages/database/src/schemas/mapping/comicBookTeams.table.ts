import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm/sql";

import { comicBooksTable } from "../tables/comicBooks.table.ts";
import { comicTeamsTable } from "../tables/comicTeams.table.ts";


export const comicBookTeamsTable = sqliteTable("comic_book_teams", {
  id: int().primaryKey({ autoIncrement: true }),
  comicBookId: int().notNull().references(() => comicBooksTable.id, {
    onDelete: "cascade",
  }),
  comicTeamId: int().notNull().references(() => comicTeamsTable.id, {
    onDelete: "cascade",
  }),
  createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});