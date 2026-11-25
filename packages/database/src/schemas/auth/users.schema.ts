import {
	index,
	int,
	integer,
	sqliteTable,
	text,
} from "drizzle-orm/sqlite-core";

export const userTable = sqliteTable("user", {
	id: int().primaryKey({ autoIncrement: true }),
	name: text().notNull(),
	email: text().notNull().unique(),
	emailVerified: integer({ mode: "boolean" }).notNull().default(false),
	image: text(),
	admin: integer({ mode: "boolean" }).notNull().default(false),
	createdAt: integer({ mode: "timestamp_ms" })
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: integer({ mode: "timestamp_ms" })
		.notNull()
		.$defaultFn(() => new Date()),
});