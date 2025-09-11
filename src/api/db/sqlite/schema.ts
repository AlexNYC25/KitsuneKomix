import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm/sql";

export const usersTable = sqliteTable("users", {
  id: int().primaryKey({ autoIncrement: true }),
  username: text().notNull().unique(),
  email: text().notNull().unique(),
  first_name: text(),
  last_name: text(),
  password_hash: text().notNull(),
  admin: int().notNull().default(0),
  created_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const appSettingsTable = sqliteTable("app_settings", {
  id: int().primaryKey({ autoIncrement: true }),
  key: text().notNull().unique(),
  value: text().notNull(),
  admin_only: int().notNull().default(0),
  created_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicLibrariesTable = sqliteTable("comic_libraries", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  path: text().notNull(),
  description: text(),
  enabled: int().notNull().default(1),
  changed_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  created_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicBooksTable = sqliteTable("comic_books", {
  id: int().primaryKey({ autoIncrement: true }),
  library_id: int().notNull().references(() => comicLibrariesTable.id, {
    onDelete: "cascade",
  }),
  file_path: text().notNull(),
  hash: text().notNull(),
  title: text(),
  series: text(),
  issue_number: text(),
  count: int(),
  volume: text(),
  alternate_series: text(),
  alternate_issue_number: text(),
  alternate_count: int(),
  page_count: int(),
  file_size: int(),
  summary: text(),
  notes: text(),
  year: int(),
  month: int(),
  day: int(),
  publisher: text(),
  publication_date: text(),
  scan_info: text(),
  languge: text(),
  format: text(),
  black_and_white: int(),
  manga: int(),
  reading_direction: text(),
  review: text(),
  age_rating: text(),
  community_rating: int(),
  created_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicPagesTable = sqliteTable("comic_pages", {
  id: int().primaryKey({ autoIncrement: true }),
  comic_book_id: int().notNull().references(() => comicBooksTable.id, {
    onDelete: "cascade",
  }),
  file_path: text().notNull(),
  page_number: int().notNull(),
  hash: text().notNull(),
  file_size: int().notNull(),
  created_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicBookCovers = sqliteTable("comic_book_covers", {
  id: int().primaryKey({ autoIncrement: true }),
  comic_book_id: int().notNull().references(() => comicBooksTable.id, {
    onDelete: "cascade",
  }),
  file_path: text().notNull(),
  created_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicBookThumbnails = sqliteTable("comic_book_thumbnails", {
	id: int().primaryKey({ autoIncrement: true }),
	comic_book_id: int().notNull().references(() => comicBooksTable.id, {
		onDelete: "cascade",
	}),
	file_path: text().notNull(),
	created_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
	updated_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicWebLinksTable = sqliteTable("comic_web_links", {
  id: int().primaryKey({ autoIncrement: true }),
  comic_book_id: int().notNull().references(() => comicBooksTable.id, {
    onDelete: "cascade",
  }),
  url: text().notNull().unique(),
  description: text(),
  created_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicSeriesTable = sqliteTable("comic_series", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  description: text(),
  folder_path: text().unique(),
  created_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicWritersTable = sqliteTable("comic_writers", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull().unique(),
  description: text(),
  created_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicPencillersTable = sqliteTable("comic_pencillers", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull().unique(),
  description: text(),
  created_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicInkersTable = sqliteTable("comic_inkers", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull().unique(),
  description: text(),
  created_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicColoristsTable = sqliteTable("comic_colorists", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull().unique(),
  description: text(),
  created_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicLetterersTable = sqliteTable("comic_letterers", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull().unique(),
  description: text(),
  created_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicEditorsTable = sqliteTable("comic_editors", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull().unique(),
  description: text(),
  created_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicCoverArtistsTable = sqliteTable("comic_cover_artists", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull().unique(),
  description: text(),
  created_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicPublishersTable = sqliteTable("comic_publishers", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull().unique(),
  description: text(),
  created_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicImprintsTable = sqliteTable("comic_imprints", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull().unique(),
  description: text(),
  created_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicGenresTable = sqliteTable("comic_genres", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull().unique(),
  description: text(),
  created_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicCharactersTable = sqliteTable("comic_characters", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull().unique(),
  description: text(),
  created_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicTeamsTable = sqliteTable("comic_teams", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull().unique(),
  description: text(),
  created_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicStoryArcsTable = sqliteTable("comic_story_arcs", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull().unique(),
  description: text(),
  created_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicSeriesGroupsTable = sqliteTable("comic_series_groups", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull().unique(),
  description: text(),
  created_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicLocationsTable = sqliteTable("comic_locations", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull().unique(),
  description: text(),
  created_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicBookWritersTable = sqliteTable("comic_book_writers", {
  id: int().primaryKey({ autoIncrement: true }),
  comic_book_id: int().notNull().references(() => comicBooksTable.id, {
    onDelete: "cascade",
  }),
  comic_writer_id: int().notNull().references(() => comicWritersTable.id, {
    onDelete: "cascade",
  }),
  created_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicBookPencillersTable = sqliteTable("comic_book_pencillers", {
  id: int().primaryKey({ autoIncrement: true }),
  comic_book_id: int().notNull().references(() => comicBooksTable.id, {
    onDelete: "cascade",
  }),
  comic_penciller_id: int().notNull().references(
    () => comicPencillersTable.id,
    { onDelete: "cascade" },
  ),
  created_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicBookInkersTable = sqliteTable("comic_book_inkers", {
  id: int().primaryKey({ autoIncrement: true }),
  comic_book_id: int().notNull().references(() => comicBooksTable.id, {
    onDelete: "cascade",
  }),
  comic_inker_id: int().notNull().references(() => comicInkersTable.id, {
    onDelete: "cascade",
  }),
  created_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicBookColoristsTable = sqliteTable("comic_book_colorists", {
  id: int().primaryKey({ autoIncrement: true }),
  comic_book_id: int().notNull().references(() => comicBooksTable.id, {
    onDelete: "cascade",
  }),
  comic_colorist_id: int().notNull().references(() => comicColoristsTable.id, {
    onDelete: "cascade",
  }),
  created_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicBookLetterersTable = sqliteTable("comic_book_letterers", {
  id: int().primaryKey({ autoIncrement: true }),
  comic_book_id: int().notNull().references(() => comicBooksTable.id, {
    onDelete: "cascade",
  }),
  comic_letterer_id: int().notNull().references(() => comicLetterersTable.id, {
    onDelete: "cascade",
  }),
  created_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicBookEditorsTable = sqliteTable("comic_book_editors", {
  id: int().primaryKey({ autoIncrement: true }),
  comic_book_id: int().notNull().references(() => comicBooksTable.id, {
    onDelete: "cascade",
  }),
  comic_editor_id: int().notNull().references(() => comicEditorsTable.id, {
    onDelete: "cascade",
  }),
  created_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicBookCoverArtistsTable = sqliteTable(
  "comic_book_cover_artists",
  {
    id: int().primaryKey({ autoIncrement: true }),
    comic_book_id: int().notNull().references(() => comicBooksTable.id, {
      onDelete: "cascade",
    }),
    comic_cover_artist_id: int().notNull().references(
      () => comicCoverArtistsTable.id,
      { onDelete: "cascade" },
    ),
    created_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
    updated_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  },
);

export const comicBookPublishersTable = sqliteTable("comic_book_publishers", {
  id: int().primaryKey({ autoIncrement: true }),
  comic_book_id: int().notNull().references(() => comicBooksTable.id, {
    onDelete: "cascade",
  }),
  comic_publisher_id: int().notNull().references(
    () => comicPublishersTable.id,
    { onDelete: "cascade" },
  ),
  created_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicBookImprintsTable = sqliteTable("comic_book_imprints", {
  id: int().primaryKey({ autoIncrement: true }),
  comic_book_id: int().notNull().references(() => comicBooksTable.id, {
    onDelete: "cascade",
  }),
  comic_imprint_id: int().notNull().references(() => comicImprintsTable.id, {
    onDelete: "cascade",
  }),
  created_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicBookGenresTable = sqliteTable("comic_book_genres", {
  id: int().primaryKey({ autoIncrement: true }),
  comic_book_id: int().notNull().references(() => comicBooksTable.id, {
    onDelete: "cascade",
  }),
  comic_genre_id: int().notNull().references(() => comicGenresTable.id, {
    onDelete: "cascade",
  }),
  created_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicBookCharactersTable = sqliteTable("comic_book_characters", {
  id: int().primaryKey({ autoIncrement: true }),
  comic_book_id: int().notNull().references(() => comicBooksTable.id, {
    onDelete: "cascade",
  }),
  comic_character_id: int().notNull().references(
    () => comicCharactersTable.id,
    { onDelete: "cascade" },
  ),
  created_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicBookLocationsTable = sqliteTable("comic_book_locations", {
  id: int().primaryKey({ autoIncrement: true }),
  comic_book_id: int().notNull().references(() => comicBooksTable.id, {
    onDelete: "cascade",
  }),
  comic_location_id: int().notNull().references(() => comicLocationsTable.id, {
    onDelete: "cascade",
  }),
  created_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicBookTeamsTable = sqliteTable("comic_book_teams", {
  id: int().primaryKey({ autoIncrement: true }),
  comic_book_id: int().notNull().references(() => comicBooksTable.id, {
    onDelete: "cascade",
  }),
  comic_team_id: int().notNull().references(() => comicTeamsTable.id, {
    onDelete: "cascade",
  }),
  created_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicBookStoryArcsTable = sqliteTable("comic_book_story_arcs", {
  id: int().primaryKey({ autoIncrement: true }),
  comic_book_id: int().notNull().references(() => comicBooksTable.id, {
    onDelete: "cascade",
  }),
  comic_story_arc_id: int().notNull().references(() => comicStoryArcsTable.id, {
    onDelete: "cascade",
  }),
  created_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicBookSeriesGroupsTable = sqliteTable(
  "comic_book_series_groups",
  {
    id: int().primaryKey({ autoIncrement: true }),
    comic_book_id: int().notNull().references(() => comicBooksTable.id, {
      onDelete: "cascade",
    }),
    comic_series_group_id: int().notNull().references(
      () => comicSeriesGroupsTable.id,
      { onDelete: "cascade" },
    ),
    created_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
    updated_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  },
);
