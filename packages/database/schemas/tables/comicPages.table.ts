import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm/sql";

import { comicBooksTable } from "./comicBooks.table.ts";

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