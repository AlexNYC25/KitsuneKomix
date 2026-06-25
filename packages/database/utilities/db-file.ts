import { join } from "@std/path"
import { exists } from "@std/fs/exists"

/**
 * Generates the folder path for the app's database sqlite file
 * @param folderPath The directory where we want to access the file
 * @returns A file path string representing the location of the sqlite file
 */
export const generateSqlFilePath = async (folderPath: string) => {
  const isRealFolder = await exists(folderPath, { isDirectory: true});

  if (!isRealFolder) {
    await Deno.mkdir(folderPath);
  }

  const sqlFilePathInFolder = join(folderPath, "database.sqlite");

  return sqlFilePathInFolder;
}