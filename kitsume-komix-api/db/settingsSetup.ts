import {checkIfSettingExists, setSetting} from "./sqlite/models/appSettings.model.ts";

/**
 * Initializes application settings in the database if they do not already exist.
 */
export const setUpAppSettings = async () => {
	const appHasBeenSetup = await checkIfSettingExists("appSetupComplete");

	if (!appHasBeenSetup) {
		await setSetting("appSetupComplete", "false");
	}
}