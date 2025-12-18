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

export const appSettingsTable = sqliteTable("app_settings", {
  id: int().primaryKey({ autoIncrement: true }),
  key: text().notNull().unique(),
  value: text().notNull(),
  adminOnly: int().notNull().default(0),
  createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicLibrariesTable = sqliteTable("comic_libraries", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  path: text().notNull(),
  description: text(),
  enabled: int().notNull().default(1),
  changedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const userComicLibrariesTable = sqliteTable("user_comic_libraries", {
  id: int().primaryKey({ autoIncrement: true }),
  userId: int().notNull().references(() => usersTable.id, {
    onDelete: "cascade",
  }),
  libraryId: int().notNull().references(() => comicLibrariesTable.id, {
    onDelete: "cascade",
  }),
  createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicLibrariesSeriesTable = sqliteTable("comic_libraries_series", {
  id: int().primaryKey({ autoIncrement: true }),
  libraryId: int().notNull().references(() => comicLibrariesTable.id, {
    onDelete: "cascade",
  }),
  comicSeriesId: int().notNull().references(() => comicSeriesTable.id, {
    onDelete: "cascade",
  }),
  createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

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

export const comicBookHistoryTable = sqliteTable("comic_book_history", {
  id: int().primaryKey({ autoIncrement: true }),
  userId: int().notNull().references(() => usersTable.id, {
    onDelete: "cascade",
  }),
  comicBookId: int().notNull().references(() => comicBooksTable.id, {
    onDelete: "cascade",
  }),
  read: int().notNull().default(0),
  lastReadPage: int(),
  createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicPagesTable = sqliteTable("comic_pages", {
  id: int().primaryKey({ autoIncrement: true }),
  comicBookId: int().notNull().references(() => comicBooksTable.id, {
    onDelete: "cascade",
  }),
  filePath: text().notNull(),
  pageNumber: int().notNull(),
  type: text().notNull(), // e.g., "Story", "Cover", etc.
  doublePage: int().notNull().default(0),
  length: int(), // in pixels
  width: int(), // in pixels
  hash: text().notNull(),
  fileSize: int().notNull(),
  createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicBookCovers = sqliteTable("comic_book_covers", {
  id: int().primaryKey({ autoIncrement: true }),
  comicPageId: int().notNull().references(() => comicPagesTable.id, {
    onDelete: "cascade",
  }),
  filePath: text().notNull(),
  createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicBookThumbnails = sqliteTable("comic_book_thumbnails", {
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

export const comicWebLinksTable = sqliteTable("comic_web_links", {
  id: int().primaryKey({ autoIncrement: true }),
  comicBookId: int().notNull().references(() => comicBooksTable.id, {
    onDelete: "cascade",
  }),
  url: text().notNull().unique(),
  description: text(),
  createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicSeriesTable = sqliteTable("comic_series", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  description: text(),
  folderPath: text().unique().notNull(),
  createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicWritersTable = sqliteTable("comic_writers", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull().unique(),
  description: text(),
  createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicPencillersTable = sqliteTable("comic_pencillers", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull().unique(),
  description: text(),
  createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicInkersTable = sqliteTable("comic_inkers", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull().unique(),
  description: text(),
  createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicColoristsTable = sqliteTable("comic_colorists", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull().unique(),
  description: text(),
  createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicLetterersTable = sqliteTable("comic_letterers", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull().unique(),
  description: text(),
  createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicEditorsTable = sqliteTable("comic_editors", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull().unique(),
  description: text(),
  createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicCoverArtistsTable = sqliteTable("comic_cover_artists", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull().unique(),
  description: text(),
  createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicPublishersTable = sqliteTable("comic_publishers", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull().unique(),
  description: text(),
  createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicImprintsTable = sqliteTable("comic_imprints", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull().unique(),
  description: text(),
  createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicGenresTable = sqliteTable("comic_genres", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull().unique(),
  description: text(),
  createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicCharactersTable = sqliteTable("comic_characters", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull().unique(),
  description: text(),
  createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicTeamsTable = sqliteTable("comic_teams", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull().unique(),
  description: text(),
  createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicStoryArcsTable = sqliteTable("comic_story_arcs", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull().unique(),
  description: text(),
  createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicSeriesGroupsTable = sqliteTable("comic_series_groups", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull().unique(),
  description: text(),
  createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicLocationsTable = sqliteTable("comic_locations", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull().unique(),
  description: text(),
  createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicSeriesBooksTable = sqliteTable("comic_series_books", {
  id: int().primaryKey({ autoIncrement: true }),
  comicSeriesId: int().notNull().references(() => comicSeriesTable.id, {
    onDelete: "cascade",
  }),
  comicBookId: int().notNull().references(() => comicBooksTable.id, {
    onDelete: "cascade",
  }),
  createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicBookWritersTable = sqliteTable("comic_book_writers", {
  id: int().primaryKey({ autoIncrement: true }),
  comicBookId: int().notNull().references(() => comicBooksTable.id, {
    onDelete: "cascade",
  }),
  comicWriterId: int().notNull().references(() => comicWritersTable.id, {
    onDelete: "cascade",
  }),
  createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicBookPencillersTable = sqliteTable("comic_book_pencillers", {
  id: int().primaryKey({ autoIncrement: true }),
  comicBookId: int().notNull().references(() => comicBooksTable.id, {
    onDelete: "cascade",
  }),
  comicPencillerId: int().notNull().references(
    () => comicPencillersTable.id,
    { onDelete: "cascade" },
  ),
  createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicBookInkersTable = sqliteTable("comic_book_inkers", {
  id: int().primaryKey({ autoIncrement: true }),
  comicBookId: int().notNull().references(() => comicBooksTable.id, {
    onDelete: "cascade",
  }),
  comicInkerId: int().notNull().references(() => comicInkersTable.id, {
    onDelete: "cascade",
  }),
  createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicBookColoristsTable = sqliteTable("comic_book_colorists", {
  id: int().primaryKey({ autoIncrement: true }),
  comicBookId: int().notNull().references(() => comicBooksTable.id, {
    onDelete: "cascade",
  }),
  comicColoristId: int().notNull().references(() => comicColoristsTable.id, {
    onDelete: "cascade",
  }),
  createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicBookLetterersTable = sqliteTable("comic_book_letterers", {
  id: int().primaryKey({ autoIncrement: true }),
  comicBookId: int().notNull().references(() => comicBooksTable.id, {
    onDelete: "cascade",
  }),
  comicLetterId: int().notNull().references(() => comicLetterersTable.id, {
    onDelete: "cascade",
  }),
  createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicBookEditorsTable = sqliteTable("comic_book_editors", {
  id: int().primaryKey({ autoIncrement: true }),
  comicBookId: int().notNull().references(() => comicBooksTable.id, {
    onDelete: "cascade",
  }),
  comicEditorId: int().notNull().references(() => comicEditorsTable.id, {
    onDelete: "cascade",
  }),
  createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicBookCoverArtistsTable = sqliteTable(
  "comic_book_cover_artists",
  {
    id: int().primaryKey({ autoIncrement: true }),
    comicBookId: int().notNull().references(() => comicBooksTable.id, {
      onDelete: "cascade",
    }),
    comicCoverArtistId: int().notNull().references(
      () => comicCoverArtistsTable.id,
      { onDelete: "cascade" },
    ),
    createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  },
);

export const comicBookPublishersTable = sqliteTable("comic_book_publishers", {
  id: int().primaryKey({ autoIncrement: true }),
  comicBookId: int().notNull().references(() => comicBooksTable.id, {
    onDelete: "cascade",
  }),
  comicPublisherId: int().notNull().references(
    () => comicPublishersTable.id,
    { onDelete: "cascade" },
  ),
  createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicBookImprintsTable = sqliteTable("comic_book_imprints", {
  id: int().primaryKey({ autoIncrement: true }),
  comicBookId: int().notNull().references(() => comicBooksTable.id, {
    onDelete: "cascade",
  }),
  comicImprintId: int().notNull().references(() => comicImprintsTable.id, {
    onDelete: "cascade",
  }),
  createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicBookGenresTable = sqliteTable("comic_book_genres", {
  id: int().primaryKey({ autoIncrement: true }),
  comicBookId: int().notNull().references(() => comicBooksTable.id, {
    onDelete: "cascade",
  }),
  comicGenreId: int().notNull().references(() => comicGenresTable.id, {
    onDelete: "cascade",
  }),
  createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicBookCharactersTable = sqliteTable("comic_book_characters", {
  id: int().primaryKey({ autoIncrement: true }),
  comicBookId: int().notNull().references(() => comicBooksTable.id, {
    onDelete: "cascade",
  }),
  comicCharacterId: int().notNull().references(
    () => comicCharactersTable.id,
    { onDelete: "cascade" },
  ),
  createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicBookLocationsTable = sqliteTable("comic_book_locations", {
  id: int().primaryKey({ autoIncrement: true }),
  comicBookId: int().notNull().references(() => comicBooksTable.id, {
    onDelete: "cascade",
  }),
  comicLocationId: int().notNull().references(() => comicLocationsTable.id, {
    onDelete: "cascade",
  }),
  createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicBookTeamsTable = sqliteTable("comic_book_teams", {
  id: int().primaryKey({ autoIncrement: true }),
  comicBookId: int().notNull().references(() => comicBooksTable.id, {
    onDelete: "cascade",
  }),
  comicTeamId: int().notNull().references(() => comicTeamsTable.id, {
    onDelete: "cascade",
  }),
  createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicBookStoryArcsTable = sqliteTable("comic_book_story_arcs", {
  id: int().primaryKey({ autoIncrement: true }),
  comicBookId: int().notNull().references(() => comicBooksTable.id, {
    onDelete: "cascade",
  }),
  comicStoryArcId: int().notNull().references(() => comicStoryArcsTable.id, {
    onDelete: "cascade",
  }),
  createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicBookSeriesGroupsTable = sqliteTable(
  "comic_book_series_groups",
  {
    id: int().primaryKey({ autoIncrement: true }),
    comicBookId: int().notNull().references(() => comicBooksTable.id, {
      onDelete: "cascade",
    }),
    comicSeriesGroupId: int().notNull().references(
      () => comicSeriesGroupsTable.id,
      { onDelete: "cascade" },
    ),
    createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  },
);
