import { int, snakeCase, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm/sql";

export const usersTable = snakeCase.table("users", {
  id: int().primaryKey({ autoIncrement: true }),
  username: text().notNull().unique(),
  email: text().notNull().unique(),
  displayName: text(),
  firstName: text(),
  lastName: text(),
  avatarUrl: text(),
  passwordHash: text().notNull(),
  passwordChangedAt: text(),
  status: text().notNull().default("active"),
  failedLoginAttempts: int().notNull().default(0),
  lockedUntil: text(),
  isAdmin: int({mode: "boolean"}).notNull().default(false),
  lastLoginAt: text(),
  createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});