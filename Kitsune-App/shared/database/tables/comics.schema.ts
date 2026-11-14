import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable("users", {
  id: integer().primaryKey({ autoIncrement: true }),
  filePath: text().notNull(),
});
