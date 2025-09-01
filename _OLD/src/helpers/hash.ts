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
  
  // Walk recursively through all files (remove maxDepth to include all subdirectories)
  for await (const entry of walk(folderPath, { includeDirs: false })) {
    if (entry.isFile) {
      try {
        // Include the file path in the hash calculation
        hashChunks.push(entry.path);
        
        // Include file stats (size, mtime) for extra change detection
        const stat = await Deno.stat(entry.path);
        hashChunks.push(String(stat.size));
        if (stat.mtime) {
          hashChunks.push(String(stat.mtime.getTime()));
        }
        
        // Include file content hash
        const fileData = await Deno.readFile(entry.path);
        const fileHash = await sha256(fileData);
        hashChunks.push(fileHash);
      } catch (err) {
        // If we can't read a file, include the error in the hash
        // This handles files that appear/disappear during processing
        const message = err instanceof Error ? err.message : String(err);
        hashChunks.push(`ERROR:${entry.path}:${message}`);
      }
    }
  }
  
  // Sort to ensure consistent hash regardless of file discovery order
  hashChunks.sort();
  
  const combinedHashes = new TextEncoder().encode(hashChunks.join(""));
  return await sha256(combinedHashes);
}
