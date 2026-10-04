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
 * Returns true when no users have been registered yet, meaning the account
 * being created is the very first one for this installation.
 */
const isFirstRegisteredUser = async (): Promise<boolean> => {
	const existingUsers = await db
		.select({ id: userTable.id })
		.from(userTable)
		.limit(1);

	return existingUsers.length === 0;
};

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
				input: false,
			},
		},
	},
	databaseHooks: {
		user: {
			create: {
				// The first registered user is granted admin rights. Every later
				// signup is forced to a non-admin account (overriding anything a
				// client may have sent in the request body).
				async before() {
					const isFirstUser = await isFirstRegisteredUser();

					return { data: { isAdmin: isFirstUser } };
				},
			},
		},
	},
});
