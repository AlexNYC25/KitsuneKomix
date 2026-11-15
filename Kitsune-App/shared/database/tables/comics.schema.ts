import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const comicsTable = sqliteTable("comics", {
	id: integer().primaryKey({ autoIncrement: true }),
	filePath: text().notNull(),
});
