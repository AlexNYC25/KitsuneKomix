import { index, int, snakeCase, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm/sql";

import { usersTable } from "./users.table.ts";
import { oauthClientsTable } from "./oauthClients.table.ts";

export const sessionsTable = snakeCase.table(
  "sessions",
  {
    id: int().primaryKey({ autoIncrement: true }),
    sessionId: text().notNull().unique(),
    userId: int().notNull().references(() => usersTable.id, {
      onDelete: "cascade",
    }),
    clientId: int().notNull().references(() => oauthClientsTable.id, {
      onDelete: "cascade",
    }),
    deviceName: text(),
    userAgent: text(),
    ipAddress: text(),
    status: text().notNull().default("active"),
    lastActivityAt: text(),
    expiresAt: text(),
    createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("sessions_user_id_idx").on(table.userId),
    index("sessions_client_id_idx").on(table.clientId),
  ],
);