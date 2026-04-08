import { asc, desc, eq, ilike, sql } from "drizzle-orm";
import { getClient } from "../client.ts";
import { appSettingsTable } from "#infrastructure/db/sqlite/schemas/index.ts";

/**
 * Retrieves a single application setting by its key.
 *
 * @param key - Unique setting key.
 * @returns The setting value when found, otherwise `null`.
 * @throws {Error} Throws when the database client is not initialized or query execution fails.
 */
export const getSetting = async (key: string): Promise<string | null> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
		const result = await db.select()
			.from(appSettingsTable)
			.where(eq(appSettingsTable.key, key))
			.limit(1);

  	return result.length > 0 ? result[0].value : null;
	} catch (error) {
		console.error("Error fetching setting:", error);
		throw error;
	}
  
};

/**
 * Creates or updates an application setting.
 *
 * If a setting with the provided key already exists, its value is updated.
 * Otherwise, a new setting row is inserted.
 *
 * @param key - Unique setting key.
 * @param value - Setting value to persist.
 * @returns Resolves when the operation completes.
 * @throws {Error} Throws when the database client is not initialized or persistence fails.
 */
export const setSetting = async (key: string, value: string): Promise<void> => {
	const { db, client } = getClient();

	if (!db || !client) {
		throw new Error("Database is not initialized.");
	}

	try {
		const existingSetting = await db.select()
			.from(appSettingsTable)
			.where(eq(appSettingsTable.key, key))
			.limit(1);

		if (existingSetting.length > 0) {
			await db.update(appSettingsTable)
				.set({ value })
				.where(eq(appSettingsTable.key, key));
		} else {
			await db.insert(appSettingsTable)
				.values({ key, value });
		}
	} catch (error) {
		console.error("Error setting value:", error);
		throw error;
	}
};

/**
 * Checks whether an application setting exists for the given key.
 *
 * @param key - Unique setting key to look up.
 * @returns `true` when a setting exists for the key, otherwise `false`.
 * @throws {Error} Throws when the database client is not initialized or query execution fails.
 */
export const checkIfSettingExists = async (key: string): Promise<boolean> => {
	const { db, client } = getClient();

	if (!db || !client) {
		throw new Error("Database is not initialized.");
	}

	try {
		const existingSetting = await db.select()
			.from(appSettingsTable)
			.where(eq(appSettingsTable.key, key))
			.limit(1);

		return existingSetting.length > 0;
	} catch (error) {
		console.error("Error checking setting existence:", error);
		throw error;
	}
};