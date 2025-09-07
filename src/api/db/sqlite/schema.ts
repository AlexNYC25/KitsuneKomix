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
	library_id: int().notNull().references(() => comicLibrariesTable.id, { onDelete: "cascade" }),
	file_path: text().notNull(),
	hash: text().notNull(),
	title: text(),
	series: text(),
	issue_number: text(),
	volume: text(),
	publisher: text(),
	publication_date: text(),
	tags: text(),
	read: int().notNull().default(0),
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

export const comicBookWritersTable = sqliteTable("comic_book_writers", {
	id: int().primaryKey({ autoIncrement: true }),
	comic_book_id: int().notNull().references(() => comicBooksTable.id, { onDelete: "cascade" }),
	comic_writer_id: int().notNull().references(() => comicWritersTable.id, { onDelete: "cascade" }),
	created_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
	updated_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comicBookPencillersTable = sqliteTable("comic_book_pencillers", {
	id: int().primaryKey({ autoIncrement: true }),
	comic_book_id: int().notNull().references(() => comicBooksTable.id, { onDelete: "cascade" }),
	comic_penciller_id: int().notNull().references(() => comicPencillersTable.id, { onDelete: "cascade" }),
	created_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
	updated_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});