import { int, snakeCase, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm/sql";

export const oauthClientsTable = snakeCase.table("oauth_clients", {
  id: int().primaryKey({ autoIncrement: true }),
  clientId: text().notNull().unique(),
  clientSecretHash: text(),
  clientName: text().notNull(),
  clientType: text().notNull().default("public"),
  description: text(),
  allowedGrantTypes: text().notNull().default("password,refresh_token"),
  redirectUris: text(),
  scopes: text().notNull().default("read"),
  status: text().notNull().default("active"),
  createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});