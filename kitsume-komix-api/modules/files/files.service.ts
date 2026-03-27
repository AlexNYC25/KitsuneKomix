
import { join, resolve, sep } from "node:path";

const COMICS_DIRECTORY = Deno.env.get("COMICS_DIRECTORY") || "/app/comics";

/**
 * Use to find the list of directories in a given path, used for the process of registering a new comic library in the system.
 * 
 * @param path an optional path to start in to list the available folders under that path
 * @returns a promise that resolves to an array of absolute folder paths in the given path, or the default comics directory if no path is provided
 */
export const listFoldersInDirectoryService = async (path?: string): Promise<Array<string>> => {
  try {
    const basePath = resolve(COMICS_DIRECTORY);
    const requestedPath = path?.trim();
    const targetPath = requestedPath ? resolve(requestedPath) : basePath;

    // Validate that the target path is within the allowed comics directory
    const isWithinBasePath =
      targetPath === basePath || targetPath.startsWith(`${basePath}${sep}`);

    if (!isWithinBasePath) {
      throw new Error("Invalid path. Path must be within the comics directory.");
    }

    // Read the contents of the target directory
    const entries = Deno.readDir(targetPath);
    
    // Filter for directories and return their absolute paths
    const folders = [];
    for await (const entry of entries) {
      if (entry.isDirectory) {
        folders.push(join(targetPath, entry.name));
      }
    }

    return folders.sort((a, b) => a.localeCompare(b));
  } catch (error) {
    console.error("Error listing folders:", error);
    throw error;
  }
};