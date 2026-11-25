import {
	index,
	int,
	integer,
	sqliteTable,
	text,
} from "drizzle-orm/sqlite-core";

export const verificationTable = sqliteTable(
	"verification",
	{
		id: int().primaryKey({ autoIncrement: true }),
		identifier: text().notNull(),
		value: text().notNull(),
		expiresAt: integer({ mode: "timestamp_ms" }).notNull(),
		createdAt: integer({ mode: "timestamp_ms" })
			.notNull()
			.$defaultFn(() => new Date()),
		updatedAt: integer({ mode: "timestamp_ms" })
			.notNull()
			.$defaultFn(() => new Date()),
	},
	(table) => [index("verification_identifier_idx").on(table.identifier)],
);
