import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { sql } from "drizzle-orm";

import { db, schema } from "../src";

const authTables = ["user", "session", "account", "verification"];

describe("db", () => {
  it("declares the better-auth tables", () => {
    for (const name of authTables) {
      assert.ok(name in schema, `missing table: ${name}`);
    }
  });

  it("connects to the sqlite file from config and runs queries", () => {
    const result = db.get<{ version: string }>(
      sql`select sqlite_version() as version`,
    );

    assert.ok(result);
    assert.equal(typeof result.version, "string");
  });
});
