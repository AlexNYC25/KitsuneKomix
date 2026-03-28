import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm/sql";

import { usersTable } from "./users.table.ts";

export const refreshTokensTable = sqliteTable("refresh_tokens", {
  id: int().primaryKey({ autoIncrement: true }),
  userId: int().notNull().references(() => usersTable.id, {
    onDelete: "cascade",
  }),
  tokenId: text().notNull().unique(), // JWT ID (jti claim)
  expiresAt: text().notNull(),
  revoked: int().notNull().default(0),
  createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});