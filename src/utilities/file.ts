

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