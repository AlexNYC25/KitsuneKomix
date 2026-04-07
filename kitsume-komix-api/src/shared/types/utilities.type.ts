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