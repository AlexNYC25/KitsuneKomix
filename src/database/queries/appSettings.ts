import db from "../database.ts";
import { AppSetting } from "../interfaces/appSetting.ts";

export const GET_APP_SETTING = `
  SELECT
    id,
    setting_name,
    setting_value
  FROM app_settings
  WHERE setting_name = ?;
`;

/**
 * Retrieves a specific application setting by its name.
 * @param {string} settingName - The name of the setting to retrieve.
 * @returns {AppSetting | null} The application setting if found, otherwise null.
 */
export function getAppSettingQuery(settingName: string): AppSetting | null {
  const stmt = db.prepare(GET_APP_SETTING);
  const row = stmt.get(settingName) as Record<string, unknown> | undefined;
  stmt.finalize();

  if (!row) {
    return null;
  }

  return {
    id: row.id as number,
    setting_name: row.setting_name as string,
    setting_value: row.setting_value as string,
  };
}

export const UPDATE_APP_SETTING = `
  UPDATE app_settings
  SET setting_value = ?
  WHERE setting_name = ?;
`;

/**
 * Updates a specific application setting with a new value.
 * @param {string} settingName - The name of the setting to update.
 * @param {string} settingValue - The new value for the setting.
 */
export function updateAppSettingQuery(settingName: string, settingValue: string): void {
  const stmt = db.prepare(UPDATE_APP_SETTING);
  stmt.run(settingValue, settingName);
  stmt.finalize();
}