import { index, int, integer, snakeCase, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm/sql";

import { userTable } from "./betterAuthUser.table.ts";

export const sessionTable = snakeCase.table(
	"session",
	{
		id: int().primaryKey({ autoIncrement: true }),
		userId: int()
			.notNull()
			.references(() => userTable.id, {
				onDelete: "cascade",
			}),
		token: text().notNull().unique(),
		expiresAt: integer({ mode: "timestamp_ms" }).notNull(),
		ipAddress: text(),
		userAgent: text(),
		createdAt: integer({ mode: "timestamp_ms" })
			.notNull()
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
		updatedAt: integer({ mode: "timestamp_ms" })
			.notNull()
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
	},
	(table) => [index("session_user_id_idx").on(table.userId)],
);
