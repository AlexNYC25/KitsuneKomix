import { walk } from "@std/fs";
import { dirname } from "@std/path";

/**
 * Recursively collects all files in a directory and their parent directories.
 *
 * @param dirPath The root directory to scan
 * @returns Array of objects with file path and parent directory
 */
export async function getFilesWithParentDirs(
  dirPath: string,
): Promise<{ file: string; directory: string }[]> {
  const results: { file: string; directory: string }[] = [];

  for await (const entry of walk(dirPath, { includeDirs: false })) {
    results.push({
      file: entry.path,
      directory: dirname(entry.path),
    });
  }

  return results;
}
