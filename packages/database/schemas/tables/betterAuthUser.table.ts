import { int, integer, snakeCase, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm/sql";

export const userTable = snakeCase.table("user", {
	id: int().primaryKey({ autoIncrement: true }),
	name: text().notNull(),
	email: text().notNull().unique(),
	emailVerified: int({ mode: "boolean" }).notNull().default(false),
	image: text(),
	displayName: text(),
	isAdmin: int({ mode: "boolean" }).notNull().default(false),
	createdAt: integer({ mode: "timestamp_ms" })
		.notNull()
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
	updatedAt: integer({ mode: "timestamp_ms" })
		.notNull()
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
});
