import { walk } from "@std/fs";

/**
 * Hash a Uint8Array using SHA-256
 * @param data - The data to hash.
 * @returns A promise that resolves to the SHA-256 hash as a hex string.
 */
async function sha256(data: Uint8Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Hash a file using SHA-256.
 * @param filePath - The path to the file to hash.
 * @returns A promise that resolves to the SHA-256 hash of the file as a hex string.
 */
export async function hashFile(filePath: string): Promise<string> {
  const data = await Deno.readFile(filePath);
  return await sha256(data);
}

/**
 * Hash all files in a folder using SHA-256.
 * @param folderPath - The path to the folder containing files to hash.
 * @returns A promise that resolves to the SHA-256 hash of all files in the folder as a hex string.
 */
export async function hashFolder(folderPath: string): Promise<string> {
  const hashChunks: string[] = [];

  for await (const entry of walk(folderPath, { maxDepth: 1, includeDirs: false })) {
    if (entry.isFile) {
      const fileData = await Deno.readFile(entry.path);
      const fileHash = await sha256(fileData);
      hashChunks.push(fileHash);
    }
  }

  const combinedHashes = new TextEncoder().encode(hashChunks.join(""));
  return await sha256(combinedHashes);
}
