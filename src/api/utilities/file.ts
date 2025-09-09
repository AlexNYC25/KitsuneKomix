export function fileExistsSync(path: string): boolean {
  try {
    const stat = Deno.statSync(path);
    return stat.isFile;
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      return false;
    }
    throw err;
  }
}

export function isFileAComicBookFile(fileName: string): boolean {
  const comicBookExtensions = [".cbz", ".cbr", ".cb7", ".cbt", ".cba"];
  const lowerCaseFileName = fileName.toLowerCase();
  return comicBookExtensions.some(ext => lowerCaseFileName.endsWith(ext));
}

/**
 * Delete a folder and all its contents recursively
 * @param folderPath - absolute path to the folder to delete
 * @returns Promise<boolean> - true if deletion was successful, false otherwise
 */
export async function deleteFolderRecursive(folderPath: string): Promise<boolean> {
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
 * Synchronous version of deleteFolderRecursive
 * @param folderPath - absolute path to the folder to delete
 * @returns boolean - true if deletion was successful, false otherwise
 */
export function deleteFolderRecursiveSync(folderPath: string): boolean {
  try {
    Deno.removeSync(folderPath, { recursive: true });
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

/**
 * Synchronous version of directoryExists
 * @param path - path to check
 * @returns boolean - true if path exists and is a directory
 */
export function directoryExistsSync(path: string): boolean {
  try {
    const stat = Deno.statSync(path);
    return stat.isDirectory;
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      return false;
    }
    throw err;
  }
}

/**
 * Safely delete a folder with additional checks
 * @param folderPath - absolute path to the folder to delete
 * @param options - deletion options
 * @returns Promise<{success: boolean, error?: string}> - result of deletion operation
 */
export async function safeDeletFolder(
  folderPath: string,
  options: {
    checkExists?: boolean;
    dryRun?: boolean;
    onProgress?: (item: string) => void;
  } = {}
): Promise<{success: boolean, error?: string}> {
  const { checkExists = true, dryRun = false, onProgress } = options;

  try {
    // Check if folder exists first
    if (checkExists) {
      const exists = await directoryExists(folderPath);
      if (!exists) {
        return { success: true }; // Nothing to delete
      }
    }

    // Optional progress callback for large deletions
    if (onProgress) {
      onProgress(`Starting deletion of: ${folderPath}`);
    }

    // Dry run mode - just report what would be deleted
    if (dryRun) {
      const items = [];
      for await (const dirEntry of Deno.readDir(folderPath)) {
        items.push(dirEntry.name);
      }
      if (onProgress) {
        onProgress(`Would delete ${items.length} items from: ${folderPath}`);
      }
      return { success: true };
    }

    // Perform actual deletion
    await Deno.remove(folderPath, { recursive: true });
    
    if (onProgress) {
      onProgress(`Successfully deleted: ${folderPath}`);
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (error instanceof Deno.errors.NotFound) {
      return { success: true }; // Already doesn't exist
    } else if (error instanceof Deno.errors.PermissionDenied) {
      return { 
        success: false, 
        error: `Permission denied deleting folder: ${folderPath}` 
      };
    } else {
      return { 
        success: false, 
        error: `Failed to delete folder ${folderPath}: ${errorMessage}` 
      };
    }
  }
}
