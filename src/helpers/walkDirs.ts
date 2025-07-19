import { walk } from "@std/fs";
import { dirname, extname, basename } from "@std/path";

/**
 * Recursively collects all files in a directory and their parent directories.
 *
 * @param dirPath The root directory to scan
 * @returns Array of objects with file path and parent directory
 */
export async function getFilesWithParentDirs(
  dirPath: string,
  ignoreHidden = true,
  allowedExtensions: string[] = []
): Promise<{ file: string; directory: string }[]> {
  const results: { file: string; directory: string }[] = [];

  for await (const entry of walk(dirPath, { includeDirs: false })) {
    const name = basename(entry.path);

    // skip hidden files (e.g. .gitignore) if requested
    if (ignoreHidden && name.startsWith(".")) continue;
    // skip macOS resource-fork files (e.g. ._…)
    if (name.startsWith("._")) continue;
    // filter by extension if provided
    if (allowedExtensions.length && !allowedExtensions.includes(extname(entry.path))) continue;

    results.push({
      file: entry.path,
      directory: dirname(entry.path),
    });
  }

  return results;
}
