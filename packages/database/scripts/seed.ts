import {
	checkIfSettingExists,
	setSetting,
} from "../models/appSettings.model.ts";

/**
 * Initializes application settings in the database if they do not already exist.
 */
export const setUpAppSettings = async () => {
	const appHasBeenSetup = await checkIfSettingExists("appSetupComplete");

	if (!appHasBeenSetup) {
		await setSetting("appSetupComplete", "false");
	}
};

/**
 * Runs all seed operations idempotently.
 *
 * NOTE: No admin user is seeded. The very first user registered through the
 * API is promoted to admin (the web client detects the absence of an admin and
 * drives a registration workflow).
 */
export const runSeed = async () => {
	await setUpAppSettings();
};
