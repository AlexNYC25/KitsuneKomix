import { getComicBookById as dbGetComicBookById } from "#infrastructure/db/sqlite/models/comicBooks.model.ts";
import { getComicPagesByComicBookId } from "#infrastructure/db/sqlite/models/comicPages.model.ts";

import {
  extractComicBookByStreaming,
  extractComicPage,
} from "#utilities/extract.ts";

import type {
  ComicBook,
  ComicBookPagesInfo,
  ComicBookStreamingServiceData,
  ComicBookStreamingServiceResult,
  ComicPage,
} from "#types/index.ts";

/**
 * Start streaming a comic book page.
 *
 * Handles the complete workflow of extracting and caching comic pages:
 * - Validates the comic exists and page is within bounds
 * - Determines optimal output format based on browser Accept header
 * - Checks and manages page cache
 * - Extracts pages from comic archive (CBZ/CBR)
 * - Converts pages to browser-compatible format
 * - Handles preloading of adjacent pages for better UX
 *
 * @param data - Streaming parameters including comic ID, page number, format preferences
 * @returns A promise that resolves to ComicBookStreamingServiceResult with page path and metadata
 * @throws Error if comic not found, page invalid, or extraction fails
 *
 * @example
 * const result = await startStreamingComicBookFile({
 *   comicId: 123,
 *   pageNumber: 5,
 *   acceptHeader: 'image/webp,image/*',
 *   preloadPagesNumber: 10
 * });
 * // Returns: { pagePath: '/cache/pages/123/5.webp', pageNumber: 5, format: 'image/webp', ... }
 *
 * @usedBy
 * - /api/comic-books/{id}/stream
 * - /api/comic-books/{id}/stream/{page}
 */
export const startStreamingComicBookFile = async (
  data: ComicBookStreamingServiceData,
) => {
  const comic = await dbGetComicBookById(data.comicId);
  if (!comic) {
    throw new Error("Comic book not found.");
  }

  const filePath = comic.filePath;

  try {
    await Deno.stat(filePath);
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      throw new Error("Comic book file not found on disk.");
    } else {
      throw error;
    }
  }

  if (data.pageNumber < 1) {
    throw new Error("Invalid page number requested.");
  }
  if (comic.pageCount && data.pageNumber > comic.pageCount) {
    throw new Error(
      "Requested page exceeds total number of pages in the comic book.",
    );
  }

  const targetFormat = determineBestOutputFormat(
    data.acceptHeader || undefined,
  );
  const formatExtension = targetFormat.split("/")[1];

  const cacheDir = "./cache/pages";
  const comicCacheDir = `${cacheDir}/${data.comicId}`;
  const cachedPagePath =
    `${comicCacheDir}/${data.pageNumber}.${formatExtension}`;

  await Deno.mkdir(comicCacheDir, { recursive: true });

  let pagePath = cachedPagePath;

  const pageInCache = await checkIfPageInCache(
    data.comicId,
    data.pageNumber,
    formatExtension,
  );

  if (!pageInCache) {
    console.log(`Page ${data.pageNumber} not in cache, extracting...`);

    const fileSize = (await Deno.stat(filePath)).size;
    const isLargeFile = fileSize > 100 * 1024 * 1024;

    if (isLargeFile) {
      const pageRange = Math.min(
        data.preloadPagesNumber,
        comic.pageCount || data.preloadPagesNumber,
      );
      const startPage = Math.max(0, data.pageNumber - 1);
      const endPage = Math.min(
        (comic.pageCount || data.pageNumber) - 1,
        startPage + pageRange,
      );

      console.log(
        `Large file detected, using streaming extraction for pages ${
          startPage + 1
        }-${endPage + 1}`,
      );

      const extractionResult = await extractComicBookByStreaming(
        filePath,
        undefined,
        startPage,
        endPage,
      );

      if (extractionResult.success && extractionResult.pages.length > 0) {
        for (let i = 0; i < extractionResult.pages.length; i++) {
          const extractedPagePath = extractionResult.pages[i];
          const pageNumber = startPage + i + 1;
          const outputPath =
            `${comicCacheDir}/${pageNumber}.${formatExtension}`;

          const conversionSuccess = await convertImageForBrowser(
            extractedPagePath,
            outputPath,
            targetFormat,
          );

          if (conversionSuccess) {
            console.log(`Cached page ${pageNumber} in ${targetFormat} format`);

            if (pageNumber === data.pageNumber) {
              pagePath = outputPath;
            }
          }
        }

        if (extractionResult.extractedPath) {
          try {
            await Deno.remove(extractionResult.extractedPath, {
              recursive: true,
            });
          } catch (error) {
            console.warn(`Could not clean up temp directory: ${error}`);
          }
        }
      } else {
        throw new Error("Failed to extract page from comic archive");
      }
    } else {
      console.log(`Small file, extracting single page ${data.pageNumber}`);

      const extractedPagePath = await extractComicPage(
        filePath,
        data.pageNumber - 1,
      );

      if (!extractedPagePath) {
        throw new Error("Failed to extract page from comic archive");
      }

      const conversionSuccess = await convertImageForBrowser(
        extractedPagePath,
        cachedPagePath,
        targetFormat,
      );

      if (!conversionSuccess) {
        throw new Error("Failed to convert image to browser-compatible format");
      }

      console.log(`Cached page ${data.pageNumber} in ${targetFormat} format`);
    }

    if (!isLargeFile && data.preloadPagesNumber > 0) {
      preloadAdjacentPages(
        data.comicId,
        data.pageNumber,
        data.preloadPagesNumber,
        targetFormat,
        comic.pageCount || 0,
      )
        .catch((error: unknown) => console.warn(`Preloading failed: ${error}`));
    }
  }

  const streamingDataResult: ComicBookStreamingServiceResult = {
    pagePath,
    pageNumber: data.pageNumber,
    format: targetFormat,
    comicId: data.comicId,
    cached: pageInCache,
  };

  return streamingDataResult;
};

/**
 * Get information about the pages of a comic book.
 *
 * Retrieves metadata about the comic's page structure including
 * total page count and any stored page information in the database.
 *
 * @param comicId - The unique identifier of the comic book
 * @returns A promise that resolves to ComicBookPagesInfo with page details
 * @throws Error if comic book not found
 *
 * @example
 * const info = await getComicPagesInfo(123);
 * // Returns: { comicId: 123, totalPages: 32, pagesInDb: 32, pages: [...] }
 *
 * @usedBy
 * - /api/comic-books/{id}/pages
 */
export const getComicPagesInfo = async (
  comicId: number,
): Promise<ComicBookPagesInfo> => {
  const comic: ComicBook | null = await dbGetComicBookById(comicId);
  if (!comic) {
    throw new Error("Comic book not found.");
  }

  const comicPages: ComicPage[] = await getComicPagesByComicBookId(comicId);

  return {
    comicId,
    totalPages: comic.pageCount || comicPages.length,
    pagesInDb: comicPages.length,
    pages: comicPages,
  };
};

/**
 * Check if a page exists in cache with the specified format.
 *
 * @param comicId - The unique identifier of the comic book
 * @param page - The page number to check
 * @param formatExtension - The file format extension (e.g., 'jpg', 'webp')
 * @returns A promise that resolves to true if page exists in cache
 */
const checkIfPageInCache = async (
  comicId: number,
  page: number,
  formatExtension: string = "jpg",
): Promise<boolean> => {
  const cacheDir = "./cache/pages";
  const pagePath = `${cacheDir}/${comicId}/${page}.${formatExtension}`;

  try {
    await Deno.stat(pagePath);
    return true;
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return false;
    } else {
      throw error;
    }
  }
};

/**
 * Preload adjacent pages for better user experience.
 *
 * Background process that extracts and caches pages ahead of the
 * current reading position to reduce perceived loading time.
 *
 * @param comicId - The unique identifier of the comic book
 * @param currentPage - The current page number being read
 * @param preloadCount - Number of pages to preload ahead
 * @param targetFormat - The target image format for caching
 * @param totalPages - Total number of pages in the comic
 */
const preloadAdjacentPages = async (
  comicId: number,
  currentPage: number,
  preloadCount: number,
  targetFormat: string,
  totalPages: number,
): Promise<void> => {
  const formatExtension = targetFormat.split("/")[1];
  const cacheDir = `./cache/pages/${comicId}`;

  const pagesToPreload: number[] = [];
  for (let i = 1; i <= preloadCount; i++) {
    const nextPage = currentPage + i;
    if (nextPage <= totalPages) {
      const pageInCache = await checkIfPageInCache(
        comicId,
        nextPage,
        formatExtension,
      );
      if (!pageInCache) {
        pagesToPreload.push(nextPage);
      }
    }
  }

  if (pagesToPreload.length > 0) {
    console.log(`Preloading pages: ${pagesToPreload.join(", ")}`);

    const comic = await dbGetComicBookById(comicId);
    if (!comic) return;

    for (const pageNum of pagesToPreload) {
      try {
        const extractedPagePath = await extractComicPage(
          comic.filePath,
          pageNum - 1,
        );

        if (extractedPagePath) {
          const outputPath = `${cacheDir}/${pageNum}.${formatExtension}`;
          const conversionSuccess = await convertImageForBrowser(
            extractedPagePath,
            outputPath,
            targetFormat,
          );

          if (conversionSuccess) {
            console.log(`Preloaded page ${pageNum}`);
          }
        }
      } catch (error) {
        console.warn(`Failed to preload page ${pageNum}: ${error}`);
      }
    }
  }
};

/**
 * Determine the best output format based on browser Accept header.
 *
 * Analyzes the browser's Accept header to select the optimal image
 * format for delivery (WebP > PNG > JPEG).
 *
 * @param acceptHeader - The browser's Accept header value
 * @returns The best matching image format MIME type
 */
const determineBestOutputFormat = (acceptHeader?: string): string => {
  if (!acceptHeader) {
    return "image/jpeg";
  }

  if (acceptHeader.includes("image/webp")) {
    return "image/webp";
  }
  if (acceptHeader.includes("image/png")) {
    return "image/png";
  }
  return "image/jpeg";
};

/**
 * Convert image to browser-compatible format.
 *
 * Handles format conversion and caching of comic pages. If the
 * source and target formats match, simply copies the file.
 *
 * @param inputPath - Path to the source image
 * @param outputPath - Path where the converted image should be saved
 * @param targetFormat - The target MIME type for conversion
 * @returns A promise that resolves to true if conversion succeeded
 */
const convertImageForBrowser = async (
  inputPath: string,
  outputPath: string,
  targetFormat: string,
): Promise<boolean> => {
  try {
    const inputExt = inputPath.toLowerCase().split(".").pop();
    const targetExt = targetFormat.split("/")[1];

    if (inputExt === targetExt) {
      await Deno.copyFile(inputPath, outputPath);
      return true;
    }

    await Deno.copyFile(inputPath, outputPath);

    return true;
  } catch (error) {
    console.error(`Error converting image format: ${error}`);
    return false;
  }
};