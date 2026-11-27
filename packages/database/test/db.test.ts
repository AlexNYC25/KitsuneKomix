import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { sql } from "drizzle-orm";

import {
	accountTable,
	comicsTable,
	db,
	schema,
	sessionTable,
	userTable,
	verificationTable,
} from "../src";

describe("db", () => {
	it("exports the auth and comics tables", () => {
		assert.ok(userTable);
		assert.ok(sessionTable);
		assert.ok(accountTable);
		assert.ok(verificationTable);
		assert.ok(comicsTable);

		assert.equal(schema.userTable, userTable);
		assert.equal(schema.sessionTable, sessionTable);
		assert.equal(schema.accountTable, accountTable);
		assert.equal(schema.verificationTable, verificationTable);
		assert.equal(schema.comicsTable, comicsTable);
	});

	it("connects to the sqlite file from config and runs queries", () => {
		const result = db.get<{ version: string }>(
			sql`select sqlite_version() as version`,
		);

		assert.ok(result);
		assert.equal(typeof result.version, "string");
	});
});
