import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm/sql";

import { usersTable } from "../tables/users.table.ts";
import { comicLibrariesTable } from "../tables/comicLibraries.table.ts";

export const userComicLibrariesTable = sqliteTable("user_comic_libraries", {
  id: int().primaryKey({ autoIncrement: true }),
  userId: int().notNull().references(() => usersTable.id, {
    onDelete: "cascade",
  }),
  libraryId: int().notNull().references(() => comicLibrariesTable.id, {
    onDelete: "cascade",
  }),
  createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});