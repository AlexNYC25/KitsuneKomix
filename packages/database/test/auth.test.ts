import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { eq } from "drizzle-orm";

import { db, schema } from "../src";

const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "sqlite",
		schema: {
			user: schema.userTable,
			session: schema.sessionTable,
			account: schema.accountTable,
			verification: schema.verificationTable,
		},
	}),
	emailAndPassword: {
		enabled: true,
	},
	advanced: {
		database: {
			generateId: "serial",
		},
	},
});

describe("better-auth adapter", () => {
	it("signs up a user with a serial id through the drizzle adapter", async () => {
		const email = `user-${Date.now()}@example.com`;

		const result = await auth.api.signUpEmail({
			body: { email, password: "super-secret-password", name: "Test User" },
		});

		assert.ok(result.user.id);
		assert.equal(result.user.email, email);

		const rows = await db
			.select()
			.from(schema.userTable)
			.where(eq(schema.userTable.email, email));

		assert.equal(rows.length, 1);
		assert.equal(rows[0].name, "Test User");
		assert.equal(rows[0].admin, false);
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
			.from(schema.sessionTable)
			.where(eq(schema.sessionTable.token, result.token));

		assert.equal(sessions.length, 1);
		assert.equal(sessions[0].userId, Number(result.user.id));
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
