import { basename, extname, join } from "@std/path";

/**
 * Supported comic book archive formats
 */
export const SUPPORTED_COMIC_FORMATS = [
  ".cbz",
  ".cbr",
  ".cb7",
  ".cbt",
  ".cba",
  ".zip",
  ".rar",
  ".7z",
  ".tar",
] as const;

/**
 * Supported image formats within comic archives
 */
export const SUPPORTED_IMAGE_FORMATS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".bmp",
  ".tiff",
  ".tif",
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
  fileSizeBytes: number;
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
  return SUPPORTED_COMIC_FORMATS.includes(
    ext as typeof SUPPORTED_COMIC_FORMATS[number],
  );
}

/**
 * Check if a file is a supported image format
 * @param filePath - path to the file to check
 * @returns boolean indicating if the file is a supported image format
 */
export function isImageFile(filePath: string): boolean {
  const ext = extname(filePath).toLowerCase();
  return SUPPORTED_IMAGE_FORMATS.includes(
    ext as typeof SUPPORTED_IMAGE_FORMATS[number],
  );
}

/**
 * Get information about a comic book archive
 * @param filePath - path to the comic book file
 * @returns ComicArchiveInfo object with details about the archive
 */
export async function getComicArchiveInfo(
  filePath: string,
): Promise<ComicArchiveInfo> {
  const format = extname(filePath).toLowerCase();
  const isSupported = isComicBookFile(filePath);

  const info: ComicArchiveInfo = {
    filePath,
    format,
    isSupported,
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
  extractToPath?: string,
): Promise<ComicExtractionResult> {
  let fileSizeBytes = 0;

  try {
    // Validate input file
    if (!isComicBookFile(comicPath)) {
      throw new Error(`Unsupported comic format: ${extname(comicPath)}`);
    }

    const stat = await Deno.stat(comicPath);
    if (!stat.isFile) {
      throw new Error("Comic path is not a file");
    }

    // Capture file size
    fileSizeBytes = stat.size;

    // Determine extraction path
    const comicBasename = basename(comicPath, extname(comicPath));
    const targetPath = extractToPath || await Deno.makeTempDir({
      prefix: `comic_extract_${comicBasename}_`,
    });

    // Ensure extraction directory exists
    await Deno.mkdir(targetPath, { recursive: true });

    const format = extname(comicPath).toLowerCase();
    let extractionSuccess = false;

    // Extract based on format
    switch (format) {
      case ".cbz":
      case ".zip":
        extractionSuccess = await extractZipArchive(comicPath, targetPath);
        break;
      case ".cbr":
      case ".rar":
        extractionSuccess = await extractRarArchive(comicPath, targetPath);
        break;
      case ".cb7":
      case ".7z":
        extractionSuccess = await extract7zArchive(comicPath, targetPath);
        break;
      case ".cbt":
      case ".tar":
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
      coverImagePath,
      fileSizeBytes,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      extractedPath: "",
      pageCount: 0,
      pages: [],
      fileSizeBytes,
      error: errorMessage,
    };
  }
}

/**
 * Extract ZIP/CBZ archives using external unzip command
 */
async function extractZipArchive(
  archivePath: string,
  targetPath: string,
): Promise<boolean> {
  try {
    // Use external unzip command
    const process = new Deno.Command("unzip", {
      args: ["-j", "-o", archivePath, "-d", targetPath],
      stdout: "null",
      stderr: "null",
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
async function extractRarArchive(
  archivePath: string,
  targetPath: string,
): Promise<boolean> {
  try {
    // Try 7z first (p7zip-full may have limited RAR support)
    const process = new Deno.Command("7z", {
      args: ["e", "-o" + targetPath, "-y", archivePath],
      stdout: "null",
      stderr: "null",
    });

    const result = await process.output();

    if (result.success) {
      return true;
    } else {
      console.warn(
        `7z could not extract RAR file: ${archivePath}. RAR format may not be fully supported.`,
      );
      return false;
    }
  } catch (error) {
    console.error(`RAR extraction error: ${error}`);
    console.error(
      `Note: Full RAR support requires additional packages not available in this container.`,
    );
    return false;
  }
}

/**
 * Extract 7Z/CB7 archives
 */
async function extract7zArchive(
  archivePath: string,
  targetPath: string,
): Promise<boolean> {
  try {
    const process = new Deno.Command("7z", {
      args: ["e", "-o" + targetPath, "-y", archivePath],
      stdout: "null",
      stderr: "null",
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
async function extractTarArchive(
  archivePath: string,
  targetPath: string,
): Promise<boolean> {
  try {
    const process = new Deno.Command("tar", {
      args: ["-xf", archivePath, "-C", targetPath],
      stdout: "null",
      stderr: "null",
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
      return aName.localeCompare(bName, undefined, {
        numeric: true,
        sensitivity: "base",
      });
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
export async function cleanupExtractedComic(
  extractedPath: string,
): Promise<void> {
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
export async function extractComicCover(
  comicPath: string,
): Promise<string | null> {
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
export async function extractComicPage(
  comicPath: string,
  pageNumber: number,
): Promise<string | null> {
  try {
    const result = await extractComicBook(comicPath);

    if (
      !result.success || pageNumber >= result.pages.length || pageNumber < 0
    ) {
      return null;
    }

    return result.pages[pageNumber];
  } catch (error) {
    console.error(`Error extracting comic page: ${error}`);
    return null;
  }
}

/**
 * Extract a specific page range from a comic book archive using streaming for large files
 * @param comicPath - path to the comic book archive
 * @param extractToPath - optional path to extract to (defaults to temp directory)
 * @param pageStart - starting page number (0-based, inclusive)
 * @param pageEnd - ending page number (0-based, inclusive)
 * @returns Promise<ComicExtractionResult> with extraction details for the page range
 */
export async function extractComicBookByStreaming(
  comicPath: string,
  extractToPath?: string,
  pageStart: number = 0,
  pageEnd: number = 0,
): Promise<ComicExtractionResult> {
  let fileSizeBytes = 0;

  try {
    // Validate input file
    if (!isComicBookFile(comicPath)) {
      throw new Error(`Unsupported comic format: ${extname(comicPath)}`);
    }

    const stat = await Deno.stat(comicPath);
    if (!stat.isFile) {
      throw new Error("Comic path is not a file");
    }

    // Validate page range
    if (pageStart < 0 || pageEnd < 0 || pageStart > pageEnd) {
      throw new Error(
        "Invalid page range: pageStart and pageEnd must be non-negative and pageStart <= pageEnd",
      );
    }

    // Capture file size
    fileSizeBytes = stat.size;

    // Determine extraction path
    const comicBasename = basename(comicPath, extname(comicPath));
    const targetPath = extractToPath || await Deno.makeTempDir({
      prefix: `comic_extract_stream_${comicBasename}_${pageStart}-${pageEnd}_`,
    });

    // Ensure extraction directory exists
    await Deno.mkdir(targetPath, { recursive: true });

    const format = extname(comicPath).toLowerCase();
    let extractedPages: string[] = [];

    // Extract based on format using streaming approach
    switch (format) {
      case ".cbz":
      case ".zip":
        extractedPages = await extractZipArchiveByRange(
          comicPath,
          targetPath,
          pageStart,
          pageEnd,
        );
        break;
      case ".cbr":
      case ".rar":
        extractedPages = await extractRarArchiveByRange(
          comicPath,
          targetPath,
          pageStart,
          pageEnd,
        );
        break;
      case ".cb7":
      case ".7z":
        extractedPages = await extract7zArchiveByRange(
          comicPath,
          targetPath,
          pageStart,
          pageEnd,
        );
        break;
      case ".cbt":
      case ".tar":
        extractedPages = await extractTarArchiveByRange(
          comicPath,
          targetPath,
          pageStart,
          pageEnd,
        );
        break;
      default:
        throw new Error(
          `Streaming extraction not implemented for format: ${format}`,
        );
    }

    if (extractedPages.length === 0) {
      throw new Error("No pages extracted in the specified range");
    }

    const coverImagePath = extractedPages.length > 0
      ? extractedPages[0]
      : undefined;

    return {
      success: true,
      extractedPath: targetPath,
      pageCount: extractedPages.length,
      pages: extractedPages,
      coverImagePath,
      fileSizeBytes,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      extractedPath: "",
      pageCount: 0,
      pages: [],
      fileSizeBytes,
      error: errorMessage,
    };
  }
}

/**
 * Extract specific page range from ZIP/CBZ archives using streaming
 */
async function extractZipArchiveByRange(
  archivePath: string,
  targetPath: string,
  pageStart: number,
  pageEnd: number,
): Promise<string[]> {
  try {
    // First, list the contents to identify image files and their order
    const listProcess = new Deno.Command("unzip", {
      args: ["-l", archivePath],
      stdout: "piped",
      stderr: "null",
    });

    const listResult = await listProcess.output();
    if (!listResult.success) {
      throw new Error("Failed to list archive contents");
    }

    const listOutput = new TextDecoder().decode(listResult.stdout);
    const imageFiles = extractImageFileNamesFromListing(listOutput);

    // Calculate the range of files to extract
    const filesToExtract = imageFiles.slice(pageStart, pageEnd + 1);

    if (filesToExtract.length === 0) {
      return [];
    }

    // Extract only the specific files
    const extractedPaths: string[] = [];
    for (const fileName of filesToExtract) {
      const process = new Deno.Command("unzip", {
        args: ["-j", "-o", archivePath, fileName, "-d", targetPath],
        stdout: "null",
        stderr: "null",
      });

      const result = await process.output();
      if (result.success) {
        const extractedPath = join(targetPath, basename(fileName));
        extractedPaths.push(extractedPath);
      }
    }

    return extractedPaths;
  } catch (error) {
    console.error(`ZIP streaming extraction error: ${error}`);
    return [];
  }
}

/**
 * Extract specific page range from RAR/CBR archives using streaming
 */
async function extractRarArchiveByRange(
  archivePath: string,
  targetPath: string,
  pageStart: number,
  pageEnd: number,
): Promise<string[]> {
  try {
    // List archive contents first
    const listProcess = new Deno.Command("7z", {
      args: ["l", archivePath],
      stdout: "piped",
      stderr: "null",
    });

    const listResult = await listProcess.output();
    if (!listResult.success) {
      throw new Error("Failed to list RAR archive contents");
    }

    const listOutput = new TextDecoder().decode(listResult.stdout);
    const imageFiles = extractImageFileNamesFrom7zListing(listOutput);

    // Calculate the range of files to extract
    const filesToExtract = imageFiles.slice(pageStart, pageEnd + 1);

    if (filesToExtract.length === 0) {
      return [];
    }

    // Extract specific files
    const extractedPaths: string[] = [];
    for (const fileName of filesToExtract) {
      const process = new Deno.Command("7z", {
        args: ["e", "-o" + targetPath, "-y", archivePath, fileName],
        stdout: "null",
        stderr: "null",
      });

      const result = await process.output();
      if (result.success) {
        const extractedPath = join(targetPath, basename(fileName));
        extractedPaths.push(extractedPath);
      }
    }

    return extractedPaths;
  } catch (error) {
    console.error(`RAR streaming extraction error: ${error}`);
    return [];
  }
}

/**
 * Extract specific page range from 7Z/CB7 archives using streaming
 */
async function extract7zArchiveByRange(
  archivePath: string,
  targetPath: string,
  pageStart: number,
  pageEnd: number,
): Promise<string[]> {
  try {
    // List archive contents first
    const listProcess = new Deno.Command("7z", {
      args: ["l", archivePath],
      stdout: "piped",
      stderr: "null",
    });

    const listResult = await listProcess.output();
    if (!listResult.success) {
      throw new Error("Failed to list 7Z archive contents");
    }

    const listOutput = new TextDecoder().decode(listResult.stdout);
    const imageFiles = extractImageFileNamesFrom7zListing(listOutput);

    // Calculate the range of files to extract
    const filesToExtract = imageFiles.slice(pageStart, pageEnd + 1);

    if (filesToExtract.length === 0) {
      return [];
    }

    // Extract specific files
    const extractedPaths: string[] = [];
    for (const fileName of filesToExtract) {
      const process = new Deno.Command("7z", {
        args: ["e", "-o" + targetPath, "-y", archivePath, fileName],
        stdout: "null",
        stderr: "null",
      });

      const result = await process.output();
      if (result.success) {
        const extractedPath = join(targetPath, basename(fileName));
        extractedPaths.push(extractedPath);
      }
    }

    return extractedPaths;
  } catch (error) {
    console.error(`7Z streaming extraction error: ${error}`);
    return [];
  }
}

/**
 * Extract specific page range from TAR/CBT archives using streaming
 */
async function extractTarArchiveByRange(
  archivePath: string,
  targetPath: string,
  pageStart: number,
  pageEnd: number,
): Promise<string[]> {
  try {
    // List archive contents first
    const listProcess = new Deno.Command("tar", {
      args: ["-tf", archivePath],
      stdout: "piped",
      stderr: "null",
    });

    const listResult = await listProcess.output();
    if (!listResult.success) {
      throw new Error("Failed to list TAR archive contents");
    }

    const listOutput = new TextDecoder().decode(listResult.stdout);
    const imageFiles = extractImageFileNamesFromTarListing(listOutput);

    // Calculate the range of files to extract
    const filesToExtract = imageFiles.slice(pageStart, pageEnd + 1);

    if (filesToExtract.length === 0) {
      return [];
    }

    // Extract specific files
    const extractedPaths: string[] = [];
    for (const fileName of filesToExtract) {
      const process = new Deno.Command("tar", {
        args: ["-xf", archivePath, "-C", targetPath, fileName],
        stdout: "null",
        stderr: "null",
      });

      const result = await process.output();
      if (result.success) {
        const extractedPath = join(targetPath, basename(fileName));
        extractedPaths.push(extractedPath);
      }
    }

    return extractedPaths;
  } catch (error) {
    console.error(`TAR streaming extraction error: ${error}`);
    return [];
  }
}

/**
 * Parse image file names from unzip listing output
 */
function extractImageFileNamesFromListing(listOutput: string): string[] {
  const lines = listOutput.split("\n");
  const imageFiles: string[] = [];

  for (const line of lines) {
    // Skip header and footer lines
    if (
      line.includes("Archive:") || line.includes("Length") ||
      line.includes("---") || line.trim() === ""
    ) {
      continue;
    }

    // Extract filename from unzip -l output (filename is typically the last part)
    const parts = line.trim().split(/\s+/);
    if (parts.length >= 4) {
      const fileName = parts.slice(3).join(" "); // Handle filenames with spaces
      if (isImageFile(fileName)) {
        imageFiles.push(fileName);
      }
    }
  }

  // Sort files naturally
  imageFiles.sort((a, b) => {
    return a.localeCompare(b, undefined, {
      numeric: true,
      sensitivity: "base",
    });
  });

  return imageFiles;
}

/**
 * Parse image file names from 7z listing output
 */
function extractImageFileNamesFrom7zListing(listOutput: string): string[] {
  const lines = listOutput.split("\n");
  const imageFiles: string[] = [];

  for (const line of lines) {
    // Skip header lines and look for file entries
    if (
      line.includes("Date") || line.includes("---") || line.trim() === "" ||
      line.includes("Listing archive")
    ) {
      continue;
    }

    // 7z output format: Date Time Attr Size Compressed Name
    const parts = line.trim().split(/\s+/);
    if (parts.length >= 6) {
      const fileName = parts.slice(5).join(" "); // Handle filenames with spaces
      if (isImageFile(fileName)) {
        imageFiles.push(fileName);
      }
    }
  }

  // Sort files naturally
  imageFiles.sort((a, b) => {
    return a.localeCompare(b, undefined, {
      numeric: true,
      sensitivity: "base",
    });
  });

  return imageFiles;
}

/**
 * Parse image file names from tar listing output
 */
function extractImageFileNamesFromTarListing(listOutput: string): string[] {
  const lines = listOutput.split("\n");
  const imageFiles: string[] = [];

  for (const line of lines) {
    const fileName = line.trim();
    if (fileName && isImageFile(fileName)) {
      imageFiles.push(fileName);
    }
  }

  // Sort files naturally
  imageFiles.sort((a, b) => {
    return a.localeCompare(b, undefined, {
      numeric: true,
      sensitivity: "base",
    });
  });

  return imageFiles;
}
