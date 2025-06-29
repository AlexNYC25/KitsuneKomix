import { getFilesWithParentDirs } from "../helpers/walkDirs.ts";
import { getAppSettingQuery, updateAppSettingQuery } from "../database/queries/appSettings.ts";
import { hashFolder, hashFile } from "../helpers/hash.ts";
import logger from "../utilities/logger.ts";

export const parseComicsDirectory = async () => {
  const dirPath = Deno.env.get("COMICS_DIR") || "";
  if (!dirPath) {
    throw new Error("COMICS_DIR environment variable is not set.");
  }

  let okToParse = false;

  // Always fetch the latest value from the DB on every call
  logger.info('ComicsParser', 'Fetching latest comic_folder_hash from DB...');
  const appSetting = getAppSettingQuery("comic_folder_hash");
  logger.info('ComicsParser', `Fetched comic_folder_hash: ${appSetting?.setting_value}`);

  if (!appSetting) {
    throw new Error("App setting 'comic_folder_hash' not found in the database.");
  }

  if (appSetting.setting_value === "NOT_SET") {
    logger.info('ComicsParser', 'Comic folder hash is not set, parsing comics directory...');
    okToParse = true;
  }

  // calculate the hash of the comics directory
  // If the hash is different from the one in the app_settings table, we need to parse the comics directory
  // If the hash is the same, we don't need to parse the comics directory
  const currentHash = await hashFolder(dirPath);
  logger.info('ComicsParser', `Current comics directory hash: ${currentHash}`);
  logger.info('ComicsParser', `DB hash: "${appSetting.setting_value}", Current hash: "${currentHash}"`);
  if (currentHash.trim() !== String(appSetting.setting_value).trim()) {
    logger.info('ComicsParser', 'Comic folder hash has changed, parsing comics directory...');
    okToParse = true;
  }

  if (!okToParse) {
    logger.info('ComicsParser', 'Comic folder hash is up to date, no need to parse comics directory.');
    return;
  }

  // Use the helper function to get files with parent directories
  // This will return an array of objects with file paths and their parent directories
  // Each object will have the structure: { filePath: string, parentDir: string }
  // This will help in organizing comics by their parent directories
  // and can be used to update the database or perform other operations as needed
  logger.info('ComicsParser', `Starting to parse comics directory: ${dirPath}`);

  const files = await getFilesWithParentDirs(dirPath);

  for (const file of files) {
    // Call the function to parse each comic file
    await parseComicFile({ file: file.file, parentDir: file.directory });

  }

  // Update the app_settings table with the new hash
  updateAppSettingQuery("comic_folder_hash", currentHash);

  logger.info('ComicsParser', `Finished parsing comics directory: ${dirPath}`);
  
}

const parseComicFile = async ({file, parentDir}: { file: string; parentDir: string }) => {
  logger.info('ComicsParser', `Parsing comic file: ${file}`);
  
  const fileHash = await hashFile(file);
  logger.info('ComicsParser', `File hash for ${file}: ${fileHash}`);
}