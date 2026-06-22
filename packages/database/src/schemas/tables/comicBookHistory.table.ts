import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm/sql";

import { comicBooksTable } from "./comicBooks.table.ts";
import { usersTable } from "./users.table.ts";

export const comicBookHistoryTable = sqliteTable("comic_book_history", {
  id: int().primaryKey({ autoIncrement: true }),
  userId: int().notNull().references(() => usersTable.id, {
    onDelete: "cascade",
  }),
  comicBookId: int().notNull().references(() => comicBooksTable.id, {
    onDelete: "cascade",
  }),
  read: int({mode: "boolean"}).notNull().default(false),
  lastReadPage: int().default(0),
  createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});