import { index, int, snakeCase, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm/sql";

import { usersTable } from "./users.table.ts";
import { oauthClientsTable } from "./oauthClients.table.ts";

export const apiKeysTable = snakeCase.table(
  "api_keys",
  {
    id: int().primaryKey({ autoIncrement: true }),
    userId: int().notNull().references(() => usersTable.id, {
      onDelete: "cascade",
    }),
    clientId: int().references(() => oauthClientsTable.id, {
      onDelete: "set null",
    }),
    name: text().notNull(),
    tokenHash: text().notNull().unique(),
    scopes: text().notNull().default("read"),
    expiresAt: text(),
    lastUsedAt: text(),
    revokedAt: text(),
    createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("api_keys_user_id_idx").on(table.userId),
  ],
);