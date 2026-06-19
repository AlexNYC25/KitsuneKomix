/**
 * Result type for comic extraction operations
 */
export type ComicExtractionResult = {
  success: boolean;
  extractedPath: string;
  pageCount: number;
  pages: string[];
  coverImagePath?: string;
  fileSizeBytes: number;
  error?: string;
};

/**
 * Configuration for thumbnail generation
 */
export type ThumbnailConfig = {
  width?: number;
  height?: number;
  quality?: number;
  preserveAspectRatio?: boolean;
  outputFormat?: "jpeg" | "png" | "webp"; // Sharp supports many formats
}

/**
 * Result of thumbnail generation
 */
export type ThumbnailResult = {
  success: boolean;
  thumbnailPath?: string;
  originalPath: string;
  error?: string;
  width?: number;
  height?: number;
  fileSize?: number;
}