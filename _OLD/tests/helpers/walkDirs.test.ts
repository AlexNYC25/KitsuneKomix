import "@std/dotenv/load";
import { assertNotEquals } from "jsr:@std/assert";

import { getFilesWithParentDirs } from "../../src/helpers/walkDirs.ts";

Deno.test("getFilesWithParentDirs - should return files with their parent directories", async () => {
  const dirPath = Deno.env.get("COMICS_DIR") || "/app/comics";
  if (!dirPath) {
    throw new Error("COMICS_DIR environment variable is not set.");
  }

  const results = await getFilesWithParentDirs(dirPath);
  
  assertNotEquals(results.length, 0, "Expected to find files in the directory");
  
  results.forEach((result) => {
    assertNotEquals(result.file, "", "File path should not be empty");
    assertNotEquals(result.directory, "", "Directory path should not be empty");
  });
});