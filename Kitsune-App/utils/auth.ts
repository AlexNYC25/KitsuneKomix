import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../shared/database/index";
import { accountTable, sessionTable, userTable, verificationTable } from "../shared/database/tables/auth.schema";

/**
 * Set up the schemas so we have a matching zod schemas for the database tables
 * that match the better-auth table schemas.
 * 
 * we match the database id generation to match the sqlite behavior
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
      admin: {
        type: "boolean",
        required: false,
        defaultValue: false,
      }
    }
  },
  databaseHooks: {
    user: {
      create: {
        // The first registered user becomes the admin. Every later signup
        // is forced to a regular account.
        async before() {
          const isFirstUser = await isFirstRegisteredUser();
          return { data: { admin: isFirstUser } };
        },
      },
    },
  },
});

async function isFirstRegisteredUser(): Promise<boolean> {
  const existingUsers = await db
    .select({ id: userTable.id })
    .from(userTable)
    .limit(1);

  return existingUsers.length === 0;
}
