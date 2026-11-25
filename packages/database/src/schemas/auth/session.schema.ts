import {
	index,
	int,
	integer,
	sqliteTable,
	text,
} from "drizzle-orm/sqlite-core";

import { userTable } from "./users.schema"

export const sessionTable = sqliteTable(
	"session",
	{
		id: int().primaryKey({ autoIncrement: true }),
		userId: int()
			.notNull()
			.references(() => userTable.id, { onDelete: "cascade" }),
		token: text().notNull().unique(),
		expiresAt: integer({ mode: "timestamp_ms" }).notNull(),
		ipAddress: text(),
		userAgent: text(),
		createdAt: integer({ mode: "timestamp_ms" })
			.notNull()
			.$defaultFn(() => new Date()),
		updatedAt: integer({ mode: "timestamp_ms" })
			.notNull()
			.$defaultFn(() => new Date()),
	},
	(table) => [index("session_user_id_idx").on(table.userId)],
);