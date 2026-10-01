import { index, int, integer, snakeCase, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm/sql";

export const verificationTable = snakeCase.table(
	"verification",
	{
		id: int().primaryKey({ autoIncrement: true }),
		identifier: text().notNull(),
		value: text().notNull(),
		expiresAt: integer({ mode: "timestamp_ms" }).notNull(),
		createdAt: integer({ mode: "timestamp_ms" })
			.notNull()
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
		updatedAt: integer({ mode: "timestamp_ms" })
			.notNull()
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
	},
	(table) => [index("verification_identifier_idx").on(table.identifier)],
);
