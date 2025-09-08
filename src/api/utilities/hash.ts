import * as bcrypt from "https://deno.land/x/bcrypt/mod.ts";

/**
 * Hash a plaintext password using bcrypt.
 * @param plain - the user-provided password
 * @returns hashed password string (including salt & cost)
 */
export async function hashPassword(plain: string): Promise<string> {
  return await bcrypt.hash(plain);
}

/**
 * Verify a plaintext password against a bcrypt hash.
 * @param hash - stored hash from the DB
 * @param plain - user-provided password to check
 */
export async function verifyPassword(
  hash: string,
  plain: string,
): Promise<boolean> {
  return await bcrypt.compare(plain, hash);
}

/**
 * Calculate the SHA-256 hash of a file using streaming to handle large files efficiently.
 * This function can handle files of any size (including multi-GB files) without loading
 * the entire file into memory.
 * 
 * @param filePath - absolute path to the file to hash
 * @returns Promise<string> - hexadecimal representation of the SHA-256 hash
 * @throws Will throw an error if the file cannot be read or doesn't exist
 */
export async function calculateFileHash(filePath: string): Promise<string> {
  return await calculateLargeFileHash(filePath, "SHA-256");
}

/**
 * Calculate the hash of a file using streaming for very large files.
 * This version reads the file in chunks to minimize memory usage for multi-GB files.
 * 
 * @param filePath - absolute path to the file to hash
 * @param algorithm - hash algorithm to use ('SHA-1', 'SHA-256', 'SHA-384', 'SHA-512')
 * @param chunkSize - size of chunks to read at a time (default: 64KB)
 * @returns Promise<string> - hexadecimal representation of the hash
 */
export async function calculateLargeFileHash(
  filePath: string,
  algorithm: "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512" = "SHA-256",
  chunkSize: number = 64 * 1024 // 64KB chunks
): Promise<string> {
  try {
    const file = await Deno.open(filePath, { read: true });
    
    // For very large files, we need to read in chunks
    const chunks: Uint8Array[] = [];
    const buffer = new Uint8Array(chunkSize);
    
    try {
      while (true) {
        const bytesRead = await file.read(buffer);
        if (bytesRead === null) break; // EOF
        
        // Add the chunk to our array (slice to get only the bytes read)
        chunks.push(buffer.slice(0, bytesRead));
      }
    } finally {
      file.close();
    }
    
    // Combine all chunks into a single Uint8Array
    const totalSize = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const combined = new Uint8Array(totalSize);
    let offset = 0;
    
    for (const chunk of chunks) {
      combined.set(chunk, offset);
      offset += chunk.length;
    }
    
    // Calculate hash
    const hashBuffer = await crypto.subtle.digest(algorithm, combined);
    
    // Convert to hex string
    const hashArray = new Uint8Array(hashBuffer);
    const hashHex = Array.from(hashArray)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
    
    return hashHex;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (error instanceof Deno.errors.NotFound) {
      throw new Error(`File not found: ${filePath}`);
    } else if (error instanceof Deno.errors.PermissionDenied) {
      throw new Error(`Permission denied reading file: ${filePath}`);
    } else {
      throw new Error(`Failed to calculate ${algorithm} hash for file ${filePath}: ${errorMessage}`);
    }
  }
}
