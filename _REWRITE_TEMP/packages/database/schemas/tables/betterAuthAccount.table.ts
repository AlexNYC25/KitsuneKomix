import { index, int, integer, snakeCase, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm/sql";

import { userTable } from "./betterAuthUser.table.ts";

export const accountTable = snakeCase.table(
	"account",
	{
		id: int().primaryKey({ autoIncrement: true }),
		userId: int()
			.notNull()
			.references(() => userTable.id, {
				onDelete: "cascade",
			}),
		accountId: text().notNull(),
		providerId: text().notNull(),
		accessToken: text(),
		refreshToken: text(),
		idToken: text(),
		accessTokenExpiresAt: integer({ mode: "timestamp_ms" }),
		refreshTokenExpiresAt: integer({ mode: "timestamp_ms" }),
		scope: text(),
		password: text(),
		createdAt: integer({ mode: "timestamp_ms" })
			.notNull()
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
		updatedAt: integer({ mode: "timestamp_ms" })
			.notNull()
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
	},
	(table) => [index("account_user_id_idx").on(table.userId)],
);
