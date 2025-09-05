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
