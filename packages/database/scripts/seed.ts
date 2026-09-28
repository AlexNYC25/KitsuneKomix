import {checkIfSettingExists, setSetting} from "../models/appSettings.model.ts";
import {createOauthClient, getOauthClientByClientId} from "../models/oauthClients.model.ts";

export const INTERNAL_WEB_CLIENT_ID = "kitsune-web";

/**
 * Initializes application settings in the database if they do not already exist.
 */
export const setUpAppSettings = async () => {
	const appHasBeenSetup = await checkIfSettingExists("appSetupComplete");

	if (!appHasBeenSetup) {
		await setSetting("appSetupComplete", "false");
	}
}

/**
 * Registers the internal web UI OAuth client if it does not already exist.
 */
export const setUpOauthClients = async () => {
	const existing = await getOauthClientByClientId(INTERNAL_WEB_CLIENT_ID);

	if (existing) {
		return;
	}

	await createOauthClient({
		clientId: INTERNAL_WEB_CLIENT_ID,
		clientName: "Kitsune Web",
		clientType: "public",
		allowedGrantTypes: "password,refresh_token",
		scopes: "read",
		status: "active",
	});
}

/**
 * Runs all seed operations idempotently.
 *
 * NOTE: No admin user is seeded. The very first user registered through the
 * API is promoted to admin (the web client detects the absence of an admin and
 * drives a registration workflow).
 */
export const runSeed = async () => {
	await setUpAppSettings();
	await setUpOauthClients();
}