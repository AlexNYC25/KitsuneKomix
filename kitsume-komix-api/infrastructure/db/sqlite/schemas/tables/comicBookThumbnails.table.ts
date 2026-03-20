import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm/sql";

import { comicBooksTable } from "./comicBooks.table.ts";
import { comicBookCovers } from "./comicBookCovers.table.ts";
import { usersTable } from "./users.table.ts";

export const comicBookThumbnailsTable = sqliteTable("comic_book_thumbnails", {
  id: int().primaryKey({ autoIncrement: true }),
  comicBookId: int().notNull().references(() => comicBooksTable.id, {
    onDelete: "cascade",
  }),
  comicBookCoverId: int().references(() => comicBookCovers.id, {
    onDelete: "cascade",
  }), // Optional - for thumbnails generated from existing pages
  filePath: text().notNull(),
  thumbnailType: text().notNull().default("generated"), // "generated" or "custom"
  name: text(), // Optional name for custom thumbnails
  description: text(), // Optional description for custom thumbnails
  uploadedBy: int().references(() => usersTable.id, {
    onDelete: "set null",
  }), // User who uploaded custom thumbnail
  createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});