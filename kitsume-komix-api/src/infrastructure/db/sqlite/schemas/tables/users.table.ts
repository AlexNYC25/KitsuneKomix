import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm/sql";

export const usersTable = sqliteTable("users", {
  id: int().primaryKey({ autoIncrement: true }),
  username: text().notNull().unique(),
  email: text().notNull().unique(),
  firstName: text(),
  lastName: text(),
  passwordHash: text().notNull(),
  admin: int().notNull().default(0),
  createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});