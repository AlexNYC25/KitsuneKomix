import sharp from "sharp";
import { dirname, extname } from "@std/path";
import { ensureDir } from "@std/fs";
import { calculateFileHash } from "./hash.ts";

/**
 * Configuration for thumbnail generation
 */
export interface ThumbnailConfig {
  width?: number;
  height?: number;
  quality?: number;
  preserveAspectRatio?: boolean;
  outputFormat?: "jpeg" | "png" | "webp"; // Sharp supports many formats
}

/**
 * Result of thumbnail generation
 */
export interface ThumbnailResult {
  success: boolean;
  thumbnailPath?: string;
  originalPath: string;
  error?: string;
  width?: number;
  height?: number;
  fileSize?: number;
}

/**
 * Default thumbnail configuration
 */
const DEFAULT_THUMBNAIL_CONFIG: Required<ThumbnailConfig> = {
  width: 300,
  height: 400,
  quality: 85,
  preserveAspectRatio: true,
  outputFormat: "jpeg", // JPEG for broad compatibility and good compression
};

/**
 * Supported image formats for thumbnail generation
 * Sharp supports many more formats than imagescript
 */
const SUPPORTED_FORMATS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".bmp",
  ".tiff",
  ".tif",
  ".svg",
  ".heic",
  ".heif",
  ".avif",
  ".jp2",
  ".jxl",
];

/**
 * Creates a thumbnail version of an image and saves it to the cache directory
 *
 * @param imagePath - Absolute path to the source image
 * @param config - Optional configuration for thumbnail generation
 * @returns Promise<ThumbnailResult> - Result containing success status and thumbnail path
 */
export async function createImageThumbnail(
  imagePath: string,
  config: ThumbnailConfig = {},
): Promise<ThumbnailResult> {
  try {
    // Merge config with defaults
    const thumbnailConfig = { ...DEFAULT_THUMBNAIL_CONFIG, ...config };

    // Validate input path
    if (!imagePath || typeof imagePath !== "string") {
      return {
        success: false,
        originalPath: imagePath,
        error: "Invalid image path provided",
      };
    }

    // Check if file exists
    let imageStats;
    try {
      imageStats = await Deno.stat(imagePath);
    } catch {
      return {
        success: false,
        originalPath: imagePath,
        error: "Image file does not exist",
      };
    }

    // Validate file is actually a file (not a directory)
    if (!imageStats.isFile) {
      return {
        success: false,
        originalPath: imagePath,
        error: "Path is not a file",
      };
    }

    // Check if the file extension is supported
    const fileExtension = extname(imagePath).toLowerCase();
    if (!SUPPORTED_FORMATS.includes(fileExtension)) {
      return {
        success: false,
        originalPath: imagePath,
        error:
          `Unsupported image format: ${fileExtension}. Supported formats: ${
            SUPPORTED_FORMATS.join(", ")
          }`,
      };
    }

    // Generate unique thumbnail filename using hash
    const imageHash = await calculateFileHash(imagePath);
    const outputExtension = thumbnailConfig.outputFormat === "jpeg"
      ? "jpg"
      : thumbnailConfig.outputFormat;
    const thumbnailFileName = `${imageHash}_thumb.${outputExtension}`;
    const thumbnailPath = `./cache/thumbnails/${thumbnailFileName}`;

    // Ensure thumbnail directory exists
    await ensureDir(dirname(thumbnailPath));

    // Check if thumbnail already exists
    try {
      const thumbnailStats = await Deno.stat(thumbnailPath);
      if (thumbnailStats.isFile) {
        // Get dimensions of existing thumbnail
        try {
          const metadata = await sharp(thumbnailPath).metadata();
          return {
            success: true,
            thumbnailPath,
            originalPath: imagePath,
            width: metadata.width,
            height: metadata.height,
            fileSize: thumbnailStats.size,
          };
        } catch {
          // If we can't get metadata, just return basic info
          return {
            success: true,
            thumbnailPath,
            originalPath: imagePath,
            fileSize: thumbnailStats.size,
          };
        }
      }
    } catch {
      // Thumbnail doesn't exist, continue with generation
    }

    // Use Sharp to process the image
    let sharpInstance = sharp(imagePath);

    // Get original image metadata
    const metadata = await sharpInstance.metadata();

    // Calculate dimensions
    let { width: targetWidth, height: targetHeight } = thumbnailConfig;

    if (
      thumbnailConfig.preserveAspectRatio && metadata.width && metadata.height
    ) {
      const aspectRatio = metadata.width / metadata.height;

      if (aspectRatio > 1) {
        // Landscape image - fit to width
        targetHeight = Math.round(targetWidth / aspectRatio);
      } else {
        // Portrait image - fit to height
        targetWidth = Math.round(targetHeight * aspectRatio);
      }
    }

    // Configure Sharp processing pipeline
    sharpInstance = sharpInstance.resize(targetWidth, targetHeight, {
      fit: thumbnailConfig.preserveAspectRatio ? "inside" : "fill",
      withoutEnlargement: false, // Allow enlargement if needed
    });

    // Configure output format and quality
    switch (thumbnailConfig.outputFormat) {
      case "jpeg":
        sharpInstance = sharpInstance.jpeg({
          quality: thumbnailConfig.quality,
          progressive: true,
          mozjpeg: true, // Use mozjpeg encoder for better compression
        });
        break;
      case "png":
        sharpInstance = sharpInstance.png({
          quality: thumbnailConfig.quality,
          progressive: true,
        });
        break;
      case "webp":
        sharpInstance = sharpInstance.webp({
          quality: thumbnailConfig.quality,
          effort: 4, // Balance between file size and encoding speed
        });
        break;
    }

    // Generate the thumbnail
    await sharpInstance.toFile(thumbnailPath);

    // Get file size and final dimensions of generated thumbnail
    const thumbnailStats = await Deno.stat(thumbnailPath);
    const finalMetadata = await sharp(thumbnailPath).metadata();

    return {
      success: true,
      thumbnailPath,
      originalPath: imagePath,
      width: finalMetadata.width || targetWidth,
      height: finalMetadata.height || targetHeight,
      fileSize: thumbnailStats.size,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      originalPath: imagePath,
      error: `Failed to create thumbnail with Sharp: ${errorMessage}`,
    };
  }
}

/**
 * Creates thumbnails for multiple images in batch
 *
 * @param imagePaths - Array of absolute paths to source images
 * @param config - Optional configuration for thumbnail generation
 * @returns Promise<ThumbnailResult[]> - Array of results for each image
 */
export async function createBatchThumbnails(
  imagePaths: string[],
  config: ThumbnailConfig = {},
): Promise<ThumbnailResult[]> {
  const results: ThumbnailResult[] = [];

  // Process images concurrently for better performance
  const promises = imagePaths.map((imagePath) =>
    createImageThumbnail(imagePath, config)
  );
  const batchResults = await Promise.allSettled(promises);

  for (const result of batchResults) {
    if (result.status === "fulfilled") {
      results.push(result.value);
    } else {
      results.push({
        success: false,
        originalPath: "unknown",
        error: `Batch processing failed: ${result.reason}`,
      });
    }
  }

  return results;
}

/**
 * Gets the thumbnail path for an image if it exists
 *
 * @param imagePath - Absolute path to the source image
 * @param outputFormat - Optional output format (defaults to 'jpeg')
 * @returns Promise<string | null> - Thumbnail path if exists, null otherwise
 */
export async function getThumbnailPath(
  imagePath: string,
  outputFormat: "jpeg" | "png" | "webp" = "jpeg",
): Promise<string | null> {
  try {
    const imageHash = await calculateFileHash(imagePath);
    const outputExtension = outputFormat === "jpeg" ? "jpg" : outputFormat;
    const thumbnailPath =
      `./cache/thumbnails/${imageHash}_thumb.${outputExtension}`;

    const stats = await Deno.stat(thumbnailPath);
    if (stats.isFile) {
      return thumbnailPath;
    }
  } catch {
    // Thumbnail doesn't exist
  }

  return null;
}

/**
 * Removes a thumbnail file if it exists
 *
 * @param imagePath - Absolute path to the source image
 * @param outputFormat - Optional output format (defaults to 'jpeg')
 * @returns Promise<boolean> - True if thumbnail was removed, false otherwise
 */
export async function removeThumbnail(
  imagePath: string,
  outputFormat: "jpeg" | "png" | "webp" = "jpeg",
): Promise<boolean> {
  try {
    const thumbnailPath = await getThumbnailPath(imagePath, outputFormat);
    if (thumbnailPath) {
      await Deno.remove(thumbnailPath);
      return true;
    }
  } catch {
    // Failed to remove thumbnail
  }

  return false;
}

/**
 * Cleans up old thumbnails that no longer have corresponding source images
 *
 * @param sourceDirectory - Directory to check for source images
 * @returns Promise<number> - Number of orphaned thumbnails removed
 */
export async function cleanupOrphanedThumbnails(
  sourceDirectory: string,
): Promise<number> {
  let removedCount = 0;

  try {
    const thumbnailDir = "./cache/thumbnails";

    // Check if thumbnail directory exists
    try {
      await Deno.stat(thumbnailDir);
    } catch {
      return 0; // No thumbnails directory
    }

    // Get all thumbnail files (support multiple formats)
    const thumbnailFiles = [];
    for await (const entry of Deno.readDir(thumbnailDir)) {
      if (
        entry.isFile && (
          entry.name.endsWith("_thumb.jpg") ||
          entry.name.endsWith("_thumb.png") ||
          entry.name.endsWith("_thumb.webp")
        )
      ) {
        thumbnailFiles.push(entry.name);
      }
    }

    // Check each thumbnail for corresponding source file
    for (const thumbnailFile of thumbnailFiles) {
      // Extract hash from filename (remove _thumb.extension)
      const hash = thumbnailFile.replace(/_thumb\.(jpg|png|webp)$/, "");
      let foundSource = false;

      // Walk through source directory to find matching hash
      try {
        for await (const entry of Deno.readDir(sourceDirectory)) {
          if (entry.isFile) {
            const filePath = `${sourceDirectory}/${entry.name}`;
            const fileHash = await calculateFileHash(filePath);
            if (fileHash === hash) {
              foundSource = true;
              break;
            }
          }
        }
      } catch {
        // Error reading source directory
        continue;
      }

      // Remove orphaned thumbnail
      if (!foundSource) {
        try {
          await Deno.remove(`${thumbnailDir}/${thumbnailFile}`);
          removedCount++;
        } catch {
          // Failed to remove file
        }
      }
    }
  } catch {
    // Error during cleanup
  }

  return removedCount;
}
