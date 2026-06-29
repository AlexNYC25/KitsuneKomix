import { join } from "node:path"
import { existsSync, mkdirSync } from "node:fs";

/**
 * Generates the folder path for the app's database sqlite file
 * @param folderPath The directory where we want to access the file
 * @returns A file path string representing the location of the sqlite file
 */
export const generateSqlFilePath = async (folderPath: string) => {
  const isRealFolder = existsSync(folderPath);

  if (!isRealFolder) {
    mkdirSync(folderPath, { recursive: true});
  }

  const sqlFilePathInFolder = join(folderPath, "database.sqlite");

  return sqlFilePathInFolder;
}