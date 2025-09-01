import "@std/dotenv/load";
import { assertEquals } from "jsr:@std/assert";

import { hashFile, hashFolder } from "../../src/helpers/hash.ts";

Deno.test("hashFile - compute SHA-256 hash of a file", async () => {
  const filePath = Deno.env.get("SINGLE_COMIC") || ""; // Adjust the path to your test file
  const expectedHash = "058e6cde5014eaa0566811c8ca066ac9c426bcec7d7bfb5469eac6ac8d1e3df9"; // Replace with the expected hash of your sample file
  const hash = await hashFile(filePath);
  assertEquals(hash, expectedHash);
});

Deno.test("hashFolder - compute SHA-256 hash of all files in a folder", async () => {
  const folderPath = Deno.env.get("COMICS_DIR") || "/app/comics"; // Adjust the path to your test folder
  const expectedHash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"; // Replace with the expected hash of your sample folder
	const hash = await hashFolder(folderPath);
	assertEquals(hash, expectedHash);
});