import { basename } from "@std/path";

/**
 * Delete a folder and all its contents recursively
 * @param folderPath - absolute path to the folder to delete
 * @returns Promise<boolean> - true if deletion was successful, false otherwise
 */
export async function deleteFolderRecursive(
  folderPath: string,
): Promise<boolean> {
  try {
    await Deno.remove(folderPath, { recursive: true });
    return true;
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      // Folder doesn't exist, consider it a success
      return true;
    }
    console.error(`Error deleting folder ${folderPath}:`, error);
    return false;
  }
}

/**
 * Check if a path exists and is a directory
 * @param path - path to check
 * @returns Promise<boolean> - true if path exists and is a directory
 */
export async function directoryExists(path: string): Promise<boolean> {
  try {
    const stat = await Deno.stat(path);
    return stat.isDirectory;
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      return false;
    }
    throw err;
  }
}

export async function getFileSize(filePath: string): Promise<number> {
  try {
    const stat = await Deno.stat(filePath);
    if (stat.isFile) {
      return stat.size;
    } else {
      throw new Error(`${filePath} is not a file.`);
    }
  } catch (error) {
    console.error(`Error getting file size for ${filePath}:`, error);
    throw error;
  }
}

export const isHiddenPath = (path: string): boolean => {
  return path.startsWith(".") || path.includes("/.");
};

export const getFileNameFromPath = (filePath: string): string => {
  return basename(filePath);
};