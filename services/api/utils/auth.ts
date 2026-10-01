import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";

import {
	accountTable,
	getClient,
	sessionTable,
	userTable,
	verificationTable,
} from "kitsune-komix-database";
import { env } from "kitsune-komix-config";

const db = await getClient();

/**
 *  Manually defined the schemas to drizzle schemas for typing later on
 *  Set the db id generation to serial to match the database schema
 *  Added additional fields to the user table for displayName and isAdmin
 *
 *  Note: Currently only email and password auth is supported
 *
 */
export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "sqlite",
		schema: {
			user: userTable,
			session: sessionTable,
			account: accountTable,
			verification: verificationTable,
		},
	}),
	secret: env.BETTER_AUTH_SECRET,
	baseURL: env.BETTER_AUTH_URL,
	trustedOrigins: [env.CLIENT_URL],
	advanced: {
		database: {
			generateId: "serial",
		},
	},
	emailAndPassword: {
		enabled: true,
	},
	user: {
		additionalFields: {
			displayName: {
				type: "string",
				required: false,
			},
			isAdmin: {
				type: "boolean",
				required: false,
				defaultValue: false,
			},
		},
	},
});
