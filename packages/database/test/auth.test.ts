import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { eq } from "drizzle-orm";

import { auth, db, schema } from "../src";

describe("auth", () => {
  it("signs up a user through the drizzle adapter", async () => {
    const email = `user-${Date.now()}@example.com`;

    const result = await auth.api.signUpEmail({
      body: { email, password: "super-secret-password", name: "Test User" },
    });

    assert.ok(result.user.id);

    const rows = await db
      .select()
      .from(schema.user)
      .where(eq(schema.user.email, email));

    assert.equal(rows.length, 1);
    assert.equal(rows[0].name, "Test User");
    assert.equal(rows[0].email, email);
  });

  it("signs in and creates a session row", async () => {
    const email = `session-${Date.now()}@example.com`;

    await auth.api.signUpEmail({
      body: { email, password: "super-secret-password", name: "Session User" },
    });

    const result = await auth.api.signInEmail({
      body: { email, password: "super-secret-password" },
    });

    assert.ok(result.token);

    const sessions = await db
      .select()
      .from(schema.session)
      .where(eq(schema.session.token, result.token));

    assert.equal(sessions.length, 1);
    assert.equal(sessions[0].userId, result.user.id);
  });

  it("rejects wrong credentials", async () => {
    const email = `invalid-${Date.now()}@example.com`;

    await auth.api.signUpEmail({
      body: { email, password: "super-secret-password", name: "Invalid User" },
    });

    await assert.rejects(
      auth.api.signInEmail({ body: { email, password: "wrong-password" } }),
    );
  });
});
