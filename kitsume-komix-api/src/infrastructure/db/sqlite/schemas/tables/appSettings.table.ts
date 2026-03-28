import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm/sql";

export const appSettingsTable = sqliteTable("app_settings", {
  id: int().primaryKey({ autoIncrement: true }),
  key: text().notNull().unique(),
  value: text().notNull(),
  adminOnly: int().notNull().default(0),
  createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});