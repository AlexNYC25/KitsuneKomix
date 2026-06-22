import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm/sql";

import { comicLibrariesTable } from "./comicLibraries.table.ts";

export const comicBooksTable = sqliteTable("comic_books", {
  id: int().primaryKey({ autoIncrement: true }),
  libraryId: int().notNull().references(() => comicLibrariesTable.id, {
    onDelete: "cascade",
  }),
  filePath: text().notNull().unique(),
  hash: text().notNull(),
  title: text(),
  series: text(),
  issueNumber: text(),
  count: int(),
  volume: text(),
  alternateSeries: text(),
  alternateIssueNumber: text(),
  alternateCount: int(),
  pageCount: int(),
  fileSize: int(),
  summary: text(),
  notes: text(),
  year: int(),
  month: int(),
  day: int(),
  publisher: text(),
  publicationDate: text(),
  scanInfo: text(),
  language: text(),
  format: text(),
  blackAndWhite: int(),
  manga: int(),
  readingDirection: text(),
  review: text(),
  ageRating: text(),
  communityRating: int(),
  createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});