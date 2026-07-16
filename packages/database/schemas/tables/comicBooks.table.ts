import { int, snakeCase, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm/sql";

import { comicLibrariesTable } from "./comicLibraries.table.ts";

export const comicBooksTable = snakeCase.table("comic_books", {
  id: int().primaryKey({ autoIncrement: true }),
  libraryId: int().notNull().references(() => comicLibrariesTable.id, {
    onDelete: "cascade",
  }),
  filePath: text().notNull().unique(),
  hash: text().notNull(),
  title: text(),
  series: text(),
  issueNumber: text(), // NOTE: This is a string because some publishers use letters in their issue numbers (e.g., "1A", "1B", "1C", etc.) or other weirdness like fractions
  count: int(),
  volumeNumber: text(),
  alternateSeries: text(),
  alternateIssueNumber: text(),
  alternateCount: int(),
  alternateVolumeNumber: text(),
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
  blackAndWhite: int({mode: "boolean"}).notNull().default(true),
  manga: int({mode: "boolean"}).notNull().default(true),
  readingDirection: text(),
  review: text(),
  ageRating: text(),
  communityRating: int(),
  createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});