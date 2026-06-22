import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm/sql";

export const comicMetadataCandidatesTable = sqliteTable("comic_metadata_candidates", {
  id: int().primaryKey({ autoIncrement: true }),
  comicBookId: int().notNull(),
  type: text().notNull(), // e.g., "title", "author", "publisher", etc.
  value: text().notNull(),
  normalizedValue: text().notNull(), // For easier searching and matching
  status: text().notNull().default("pending"), // "pending", "accepted", "rejected"
  resolvedId: int(),
  createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});