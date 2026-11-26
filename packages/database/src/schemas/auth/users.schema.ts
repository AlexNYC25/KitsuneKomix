import { relations, sql } from "drizzle-orm";
import {
	index,
	int,
	integer,
	sqliteTable,
	text,
} from "drizzle-orm/sqlite-core";

import { sessionTable } from "./session.schema";
import { accountTable } from "./account.schema";

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

export const userRelations = relations(userTable, ({ many }) => ({
	sessions: many(sessionTable),
	accounts: many(accountTable),
}));