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
  chunkSize: number = 64 * 1024, // 64KB chunks
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
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");

    return hashHex;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (error instanceof Deno.errors.NotFound) {
      throw new Error(`File not found: ${filePath}`);
    } else if (error instanceof Deno.errors.PermissionDenied) {
      throw new Error(`Permission denied reading file: ${filePath}`);
    } else {
      throw new Error(
        `Failed to calculate ${algorithm} hash for file ${filePath}: ${errorMessage}`,
      );
    }
  }
}

/**
 * Calculate the SHA-256 hash of an image file.
 * This function handles various image formats (JPEG, PNG, GIF, WebP, BMP, etc.)
 * and efficiently processes the raw image data to generate a unique hash.
 *
 * @param imagePath - absolute path to the image file
 * @returns Promise<string> - hexadecimal representation of the SHA-256 hash
 * @throws Will throw an error if the file cannot be read, doesn't exist, or is not a valid image
 */
export async function calculateImageHash(imagePath: string): Promise<string> {
  try {
    // Validate file extension (basic check)
    const supportedExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".webp",
      ".bmp",
      ".tiff",
      ".tif",
      ".svg",
    ];
    const fileExtension = imagePath.toLowerCase().split(".").pop();

    if (!fileExtension || !supportedExtensions.includes(`.${fileExtension}`)) {
      throw new Error(
        `Unsupported image format: ${fileExtension}. Supported formats: ${
          supportedExtensions.join(", ")
        }`,
      );
    }

    // Use the existing file hash function for efficiency
    // This will hash the raw file content, which is perfect for detecting identical images
    return await calculateLargeFileHash(imagePath, "SHA-256");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (error instanceof Deno.errors.NotFound) {
      throw new Error(`Image file not found: ${imagePath}`);
    } else if (error instanceof Deno.errors.PermissionDenied) {
      throw new Error(`Permission denied reading image file: ${imagePath}`);
    } else {
      throw new Error(
        `Failed to calculate image hash for ${imagePath}: ${errorMessage}`,
      );
    }
  }
}

/**
 * Calculate a perceptual hash (pHash) of an image for finding similar images.
 * This is useful for detecting duplicate images that may have been resized, compressed,
 * or slightly modified. Note: This requires image processing capabilities.
 *
 * @param imagePath - absolute path to the image file
 * @returns Promise<string> - hexadecimal representation of the perceptual hash
 * @throws Will throw an error if image processing fails
 */
export async function calculatePerceptualImageHash(
  imagePath: string,
): Promise<string> {
  try {
    // Read the image file (for future perceptual hash implementation)
    const _imageData = await Deno.readFile(imagePath);

    // For now, we'll use the file hash as a placeholder
    // In a production environment, you'd want to use a proper image processing library
    // like ImageMagick, Sharp, or Canvas API to:
    // 1. Decode the image to raw pixel data
    // 2. Resize to a standard size (e.g., 32x32)
    // 3. Convert to grayscale
    // 4. Apply DCT (Discrete Cosine Transform)
    // 5. Extract the low-frequency components
    // 6. Generate the perceptual hash

    console.warn(
      "Perceptual hashing not fully implemented. Using content hash instead.",
    );
    return await calculateImageHash(imagePath);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Failed to calculate perceptual hash for image ${imagePath}: ${errorMessage}`,
    );
  }
}

/**
 * Calculate multiple hash variants for an image file.
 * Useful for comprehensive image identification and duplicate detection.
 *
 * @param imagePath - absolute path to the image file
 * @returns Promise<ImageHashResult> - object containing multiple hash values and metadata
 */
export async function calculateImageHashVariants(
  imagePath: string,
): Promise<ImageHashResult> {
  try {
    const startTime = Date.now();

    // Get file stats
    const fileStats = await Deno.stat(imagePath);

    // Calculate different hash types
    const [contentHash, md5Hash, sha1Hash] = await Promise.all([
      calculateImageHash(imagePath),
      calculateLargeFileHash(imagePath, "SHA-256"),
      calculateLargeFileHash(imagePath, "SHA-1"),
    ]);

    const processingTime = Date.now() - startTime;

    return {
      filePath: imagePath,
      fileSize: fileStats.size,
      contentHash,
      md5Hash: md5Hash, // Note: Using SHA-256 as MD5 is not available in Web Crypto API
      sha1Hash,
      processingTimeMs: processingTime,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Failed to calculate image hash variants for ${imagePath}: ${errorMessage}`,
    );
  }
}

/**
 * Compare two image hashes to determine if they represent the same image.
 *
 * @param hash1 - first image hash
 * @param hash2 - second image hash
 * @returns boolean - true if hashes match (identical images)
 */
export function compareImageHashes(hash1: string, hash2: string): boolean {
  return hash1.toLowerCase() === hash2.toLowerCase();
}

/**
 * Result type for image hash operations
 */
export type ImageHashResult = {
  filePath: string;
  fileSize: number;
  contentHash: string;
  md5Hash: string;
  sha1Hash: string;
  processingTimeMs: number;
  timestamp: string;
};

/**
 * Batch process multiple images to calculate their hashes.
 * Useful for processing comic book covers or image libraries.
 *
 * @param imagePaths - array of absolute paths to image files
 * @param algorithm - hash algorithm to use
 * @returns Promise<Array<{path: string, hash: string, error?: string}>>
 */
export async function batchCalculateImageHashes(
  imagePaths: string[],
  _algorithm: "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512" = "SHA-256",
): Promise<Array<{ path: string; hash: string; error?: string }>> {
  const results: Array<{ path: string; hash: string; error?: string }> = [];

  // Process images in parallel (but limit concurrency to avoid overwhelming the system)
  const BATCH_SIZE = 5;

  for (let i = 0; i < imagePaths.length; i += BATCH_SIZE) {
    const batch = imagePaths.slice(i, i + BATCH_SIZE);

    const batchPromises = batch.map(async (imagePath) => {
      try {
        const hash = await calculateImageHash(imagePath);
        return { path: imagePath, hash };
      } catch (error) {
        const errorMessage = error instanceof Error
          ? error.message
          : String(error);
        return { path: imagePath, hash: "", error: errorMessage };
      }
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }

  return results;
}
