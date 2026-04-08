import sharp from "sharp";
import { dirname, extname } from "@std/path";
import { ensureDir } from "@std/fs";
import { calculateFileHash } from "./hash.ts";

import { env } from "#config/env.ts"; 

import { ThumbnailConfig, ThumbnailResult } from "#types/index.ts";

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
    if (!env.SUPPORTED_IMAGE_FORMATS.includes(fileExtension as typeof env.SUPPORTED_IMAGE_FORMATS[number])) {
      return {
        success: false,
        originalPath: imagePath,
        error:
          `Unsupported image format: ${fileExtension}. Supported formats: ${
            env.SUPPORTED_IMAGE_FORMATS.join(", ")
          }`,
      };
    }

    // Generate unique thumbnail filename using hash
    const imageHash = await calculateFileHash(imagePath);
    const outputExtension = thumbnailConfig.outputFormat === "jpeg"
      ? "jpg"
      : thumbnailConfig.outputFormat;
    const thumbnailFileName = `${imageHash}_thumb.${outputExtension}`;
    const thumbnailPath = `/app/cache/thumbnails/${thumbnailFileName}`;

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
