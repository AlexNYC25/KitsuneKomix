import { eq } from "drizzle-orm";

import { dbLogger } from "kitsune-komix-logging";

import { getClient } from "../drizzle/client.ts";
import { userTable, verificationTable } from "../schemas/index.ts";

import type { AuthUser, DrizzleType } from "../shared/types/index.ts";

/**
 * Deletes a user and everything tied to it. Sessions, accounts, comic
 * history and library assignments are removed by their foreign-key cascade;
 * thumbnail `uploadedBy` references are nulled. Any verification rows keyed
 * by the user's email are also removed so the install stays clean.
 *
 * @param userId - The id of the user to delete.
 * @returns `{ deleted: true }` when a user was removed, `{ deleted: false }`
 * when no user exists with the given id.
 * @throws {Error} Throws when the database client is not initialized or the
 * delete fails.
 */
export const deleteUser = async (
	userId: number,
): Promise<{ deleted: boolean }> => {
	const db: DrizzleType = await getClient();

	if (!db) {
		throw new Error("Database is not initialized.");
	}

	try {
		const existingUsers: AuthUser[] = await db
			.select()
			.from(userTable)
			.where(eq(userTable.id, userId))
			.limit(1);

		if (existingUsers.length === 0) {
			return { deleted: false };
		}

		const email: string = existingUsers[0]!.email;

		await db
			.delete(verificationTable)
			.where(eq(verificationTable.identifier, email));

		await db.delete(userTable).where(eq(userTable.id, userId));

		return { deleted: true };
	} catch (error) {
		dbLogger.error("Error deleting user:" + error);
		throw error;
	}
};