import { eq } from "drizzle-orm";
import { db, userTable } from "kitsune-database";

/**
 * Tells the client whether an admin account already exists, so the
 * login page can decide between the registration and login forms.
 */
export default defineEventHandler(async () => {
	const adminUsers = await db
		.select({ id: userTable.id })
		.from(userTable)
		.where(eq(userTable.admin, true))
		.limit(1);

	return { hasAdmin: adminUsers.length > 0 };
});
