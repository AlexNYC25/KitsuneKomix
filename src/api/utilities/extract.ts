import { join, extname, basename } from "@std/path";

/**
 * Supported comic book archive formats
 */
export const SUPPORTED_COMIC_FORMATS = [
  '.cbz', '.cbr', '.cb7', '.cbt', '.cba',
  '.zip', '.rar', '.7z', '.tar'
] as const;

/**
 * Supported image formats within comic archives
 */
export const SUPPORTED_IMAGE_FORMATS = [
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.tif'
] as const;

/**
 * Result type for comic extraction operations
 */
export type ComicExtractionResult = {
  success: boolean;
  extractedPath: string;
  pageCount: number;
  pages: string[];
  coverImagePath?: string;
  error?: string;
};

/**
 * Information about a comic book archive
 */
export type ComicArchiveInfo = {
  filePath: string;
  format: string;
  isSupported: boolean;
  estimatedPageCount?: number;
};

/**
 * Check if a file is a supported comic book format
 * @param filePath - path to the file to check
 * @returns boolean indicating if the file is a supported comic format
 */
export function isComicBookFile(filePath: string): boolean {
  const ext = extname(filePath).toLowerCase();
  return SUPPORTED_COMIC_FORMATS.includes(ext as typeof SUPPORTED_COMIC_FORMATS[number]);
}

/**
 * Check if a file is a supported image format
 * @param filePath - path to the file to check
 * @returns boolean indicating if the file is a supported image format
 */
export function isImageFile(filePath: string): boolean {
  const ext = extname(filePath).toLowerCase();
  return SUPPORTED_IMAGE_FORMATS.includes(ext as typeof SUPPORTED_IMAGE_FORMATS[number]);
}

/**
 * Get information about a comic book archive
 * @param filePath - path to the comic book file
 * @returns ComicArchiveInfo object with details about the archive
 */
export async function getComicArchiveInfo(filePath: string): Promise<ComicArchiveInfo> {
  const format = extname(filePath).toLowerCase();
  const isSupported = isComicBookFile(filePath);
  
  const info: ComicArchiveInfo = {
    filePath,
    format,
    isSupported
  };

  if (!isSupported) {
    return info;
  }

  try {
    const stat = await Deno.stat(filePath);
    if (!stat.isFile) {
      throw new Error("Path is not a file");
    }
    
    // For now, we can't easily get page count without extracting
    // In the future, we could use archive libraries to list contents
    info.estimatedPageCount = 0;
  } catch (error) {
    console.error(`Error getting comic archive info: ${error}`);
  }

  return info;
}

/**
 * Extract a comic book archive to a temporary directory
 * @param comicPath - path to the comic book archive
 * @param extractToPath - optional path to extract to (defaults to temp directory)
 * @returns Promise<ComicExtractionResult> with extraction details
 */
export async function extractComicBook(
  comicPath: string, 
  extractToPath?: string
): Promise<ComicExtractionResult> {
  try {
    // Validate input file
    if (!isComicBookFile(comicPath)) {
      throw new Error(`Unsupported comic format: ${extname(comicPath)}`);
    }

    const stat = await Deno.stat(comicPath);
    if (!stat.isFile) {
      throw new Error("Comic path is not a file");
    }

    // Determine extraction path
    const comicBasename = basename(comicPath, extname(comicPath));
    const targetPath = extractToPath || await Deno.makeTempDir({ 
      prefix: `comic_extract_${comicBasename}_` 
    });

    // Ensure extraction directory exists
    await Deno.mkdir(targetPath, { recursive: true });

    const format = extname(comicPath).toLowerCase();
    let extractionSuccess = false;

    // Extract based on format
    switch (format) {
      case '.cbz':
      case '.zip':
        extractionSuccess = await extractZipArchive(comicPath, targetPath);
        break;
      case '.cbr':
      case '.rar':
        extractionSuccess = await extractRarArchive(comicPath, targetPath);
        break;
      case '.cb7':
      case '.7z':
        extractionSuccess = await extract7zArchive(comicPath, targetPath);
        break;
      case '.cbt':
      case '.tar':
        extractionSuccess = await extractTarArchive(comicPath, targetPath);
        break;
      default:
        throw new Error(`Extraction not implemented for format: ${format}`);
    }

    if (!extractionSuccess) {
      throw new Error("Archive extraction failed");
    }

    // Find and sort image files
    const pages = await findImageFiles(targetPath);
    const coverImagePath = pages.length > 0 ? pages[0] : undefined;

    return {
      success: true,
      extractedPath: targetPath,
      pageCount: pages.length,
      pages,
      coverImagePath
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      extractedPath: "",
      pageCount: 0,
      pages: [],
      error: errorMessage
    };
  }
}

/**
 * Extract ZIP/CBZ archives using external unzip command
 */
async function extractZipArchive(archivePath: string, targetPath: string): Promise<boolean> {
  try {
    // Use external unzip command
    const process = new Deno.Command("unzip", {
      args: ["-j", "-o", archivePath, "-d", targetPath],
      stdout: "null",
      stderr: "null"
    });
    
    const { success } = await process.output();
    
    if (success) {
      return true;
    } else {
      console.error(`External unzip command failed for file: ${archivePath}`);
      return false;
    }
  } catch (error) {
    console.error(`ZIP extraction error: ${error}`);
    console.error("External unzip command is not available or failed");
    return false;
  }
}

/**
 * Extract RAR/CBR archives
 */
async function extractRarArchive(archivePath: string, targetPath: string): Promise<boolean> {
  try {
    // Try 7z first (p7zip-full may have limited RAR support)
    const process = new Deno.Command("7z", {
      args: ["e", "-o" + targetPath, "-y", archivePath],
      stdout: "null",
      stderr: "null"
    });
    
    const result = await process.output();
    
    if (result.success) {
      return true;
    } else {
      console.warn(`7z could not extract RAR file: ${archivePath}. RAR format may not be fully supported.`);
      return false;
    }
  } catch (error) {
    console.error(`RAR extraction error: ${error}`);
    console.error(`Note: Full RAR support requires additional packages not available in this container.`);
    return false;
  }
}

/**
 * Extract 7Z/CB7 archives
 */
async function extract7zArchive(archivePath: string, targetPath: string): Promise<boolean> {
  try {
    const process = new Deno.Command("7z", {
      args: ["e", "-o" + targetPath, "-y", archivePath],
      stdout: "null",
      stderr: "null"
    });
    
    const { success } = await process.output();
    return success;
  } catch (error) {
    console.error(`7Z extraction error: ${error}`);
    return false;
  }
}

/**
 * Extract TAR/CBT archives
 */
async function extractTarArchive(archivePath: string, targetPath: string): Promise<boolean> {
  try {
    const process = new Deno.Command("tar", {
      args: ["-xf", archivePath, "-C", targetPath],
      stdout: "null",
      stderr: "null"
    });
    
    const { success } = await process.output();
    return success;
  } catch (error) {
    console.error(`TAR extraction error: ${error}`);
    return false;
  }
}

/**
 * Find and sort image files in a directory
 * @param directoryPath - path to search for images
 * @returns Promise<string[]> sorted array of image file paths
 */
export async function findImageFiles(directoryPath: string): Promise<string[]> {
  const imageFiles: string[] = [];
  
  try {
    for await (const dirEntry of Deno.readDir(directoryPath)) {
      if (dirEntry.isFile && isImageFile(dirEntry.name)) {
        imageFiles.push(join(directoryPath, dirEntry.name));
      }
    }
    
    // Sort files naturally (handles numeric sequences properly)
    imageFiles.sort((a, b) => {
      const aName = basename(a);
      const bName = basename(b);
      return aName.localeCompare(bName, undefined, { numeric: true, sensitivity: 'base' });
    });
    
  } catch (error) {
    console.error(`Error finding image files: ${error}`);
  }
  
  return imageFiles;
}

/**
 * Clean up extracted comic files
 * @param extractedPath - path to the extracted comic directory
 */
export async function cleanupExtractedComic(extractedPath: string): Promise<void> {
  try {
    await Deno.remove(extractedPath, { recursive: true });
  } catch (error) {
    console.error(`Error cleaning up extracted comic: ${error}`);
  }
}

/**
 * Get the cover image from a comic book without full extraction
 * @param comicPath - path to the comic book archive
 * @returns Promise<string | null> path to the extracted cover image or null if failed
 */
export async function extractComicCover(comicPath: string): Promise<string | null> {
  try {
    const result = await extractComicBook(comicPath);
    
    if (!result.success || !result.coverImagePath) {
      return null;
    }
    
    // Copy cover to a permanent location if needed
    const coverPath = result.coverImagePath;
    
    // TODO: extract to the permanent covers directory and clean up temp files
    // note the location of the cover image for later use
    return coverPath;
  } catch (error) {
    console.error(`Error extracting comic cover: ${error}`);
    return null;
  }
}

/**
 * Extract a specific page from a comic book
 * @param comicPath - path to the comic book archive
 * @param pageNumber - page number to extract (0-based)
 * @returns Promise<string | null> path to the extracted page image or null if failed
 */
export async function extractComicPage(comicPath: string, pageNumber: number): Promise<string | null> {
  try {
    const result = await extractComicBook(comicPath);
    
    if (!result.success || pageNumber >= result.pages.length || pageNumber < 0) {
      return null;
    }
    
    return result.pages[pageNumber];
  } catch (error) {
    console.error(`Error extracting comic page: ${error}`);
    return null;
  }
}
