import { getClient } from "../db/sqlite/client.ts";

import {
  extractComicBookByStreaming,
  extractComicPage,
} from "../utilities/extract.ts";

import {
  ComicBook,
  ComicBookHistory,
  ComicBookThumbnail,
  ComicBookWithMetadata,
  ComicCharacter,
  ComicColorist,
  ComicCoverArtist,
  ComicEditor,
  ComicGenre,
  ComicImprint,
  ComicInker,
  ComicLetterer,
  ComicLocation,
  ComicPenciller,
  ComicPublisher,
  ComicSeriesGroup,
  ComicStoryArc,
  ComicTeam,
  ComicWriter,
} from "../types/index.ts";
import {
  getAllComicBooksSortByDate,
  getAllComicBooksSortByFileName,
  getComicBookById,
  getComicBooksWithMetadata,
  getComicDuplicates,
  getRandomBook,
} from "../db/sqlite/models/comicBooks.model.ts";
import type { ComicBookQueryParams } from "../interfaces/RequestParams.interface.ts";

import { getWritersByComicBookId } from "../db/sqlite/models/comicWriters.model.ts";
import { getColoristByComicBookId } from "../db/sqlite/models/comicColorists.model.ts";
import { getPencillersByComicBookId } from "../db/sqlite/models/comicPencillers.model.ts";
import { getInkersByComicBookId } from "../db/sqlite/models/comicInkers.model.ts";
import { getLetterersByComicBookId } from "../db/sqlite/models/comicLetterers.model.ts";
import { getEditorsByComicBookId } from "../db/sqlite/models/comicEditors.model.ts";
import { getCoverArtistsByComicBookId } from "../db/sqlite/models/comicCoverArtists.model.ts";

import { getPublishersByComicBookId } from "../db/sqlite/models/comicPublishers.model.ts";
import { getImprintsByComicBookId } from "../db/sqlite/models/comicImprints.model.ts";

import { getGenresForComicBook } from "../db/sqlite/models/comicGenres.model.ts";
import { getCharactersByComicBookId } from "../db/sqlite/models/comicCharacters.model.ts";
import { getTeamsByComicBookId } from "../db/sqlite/models/comicTeams.model.ts";
import { getLocationsByComicBookId } from "../db/sqlite/models/comicLocations.model.ts";

import { getStoryArcsByComicBookId } from "../db/sqlite/models/comicStoryArcs.model.ts";
import { getSeriesGroupsByComicBookId } from "../db/sqlite/models/comicSeriesGroups.model.ts";

import { getComicPagesByComicBookId } from "../db/sqlite/models/comicPages.model.ts";

import {
  deleteComicBookThumbnail,
  getComicThumbnailById,
  getThumbnailsByComicBookId,
  insertCustomComicBookThumbnail,
} from "../db/sqlite/models/comicBookThumbnails.model.ts";

import {
  getComicBooksInSeries,
  getSeriesIdFromComicBook,
} from "../db/sqlite/models/comicSeries.model.ts";

import {
  getComicBookHistoryByUserAndComic,
  insertComicBookHistory,
  updateComicBookHistory,
} from "../db/sqlite/models/comicBookHistory.model.ts";

type requestQueryParameters = {
  page?: number;
  pageSize?: number;
};

type requestSortParameters = {
  sort?: string;
  sortProperty?: string;
  sortOrder?: "asc" | "desc";
};

type requestFilterParameters = {
  filter?: string;
  filterProperty?: string;
};

const DEFAULT_PAGE_SIZE = 20;

// This should be the new main function to fetch comic books with all related data
/**
 * Fetch all comic books with related metadata.
 * @param requestQueryParameters 
 * @param requestFilterParameters 
 * @param requestSortParameters 
 * @returns A promise that resolves to an array of ComicBook objects with related metadata
 * 
 * used by /api/comic-books/all
 */
export const fetchAllComicBooksWithRelatedData = async (
  requestQueryParameters: requestQueryParameters,
  requestFilterParameters: requestFilterParameters,
  requestSortParameters: requestSortParameters,
) => {
  // Set default pagination values
  if (!requestQueryParameters.page || requestQueryParameters.page < 1) {
    requestQueryParameters.page = 1;
  }

  if (!requestQueryParameters.pageSize || requestQueryParameters.pageSize < 1) {
    requestQueryParameters.pageSize = DEFAULT_PAGE_SIZE;
  }

  // Calculate offset for pagination
  const offset = (requestQueryParameters.page - 1) *
    requestQueryParameters.pageSize;

  try {
    // Build the query parameters for the new database function
    const queryParams: ComicBookQueryParams = {
      offset,
      limit: requestQueryParameters.pageSize + 1, // +1 to check for next page
    };

    // Map filter parameters
    if (
      requestFilterParameters.filterProperty && requestFilterParameters.filter
    ) {
      const filterValue = requestFilterParameters.filter.trim();
      const filterProperty = requestFilterParameters.filterProperty
        .toLowerCase();

      switch (filterProperty) {
        case "title":
          queryParams.titleFilter = filterValue;
          break;
        case "series":
        case "series_name":
          queryParams.seriesFilter = filterValue;
          break;
        case "writer":
        case "writers":
          queryParams.writerFilter = filterValue;
          break;
        case "artist":
        case "penciller":
        case "inker":
        case "colorist":
        case "cover_artist":
          queryParams.artistFilter = filterValue;
          break;
        case "publisher":
        case "publishers":
          queryParams.publisherFilter = filterValue;
          break;
        case "genre":
        case "genres":
          queryParams.genreFilter = filterValue;
          break;
        case "character":
        case "characters":
          queryParams.characterFilter = filterValue;
          break;
        case "year":
        case "publication_year": {
          const yearNum = parseInt(filterValue);
          if (!isNaN(yearNum)) {
            queryParams.yearFilter = yearNum;
          }
          break;
        }
        default:
          // Use general filter for unrecognized properties
          queryParams.generalFilter = filterValue;
          break;
      }
    }

    // Map sort parameters
    if (requestSortParameters.sortProperty && requestSortParameters.sort) {
      const sortProperty = requestSortParameters.sortProperty.toLowerCase();

      // Map sort properties to the database function's expected values
      switch (sortProperty) {
        case "title":
          queryParams.sortBy = "title";
          break;
        case "series":
        case "series_name":
          queryParams.sortBy = "series";
          break;
        case "issue_number":
          queryParams.sortBy = "issue_number";
          break;
        case "publication_year":
        case "year":
          queryParams.sortBy = "publication_year";
          break;
        case "created_at":
          queryParams.sortBy = "created_at";
          break;
        case "updated_at":
          queryParams.sortBy = "updated_at";
          break;
        case "file_name":
        case "file_path":
          queryParams.sortBy = "file_name";
          break;
        case "writer":
          queryParams.sortBy = "writer";
          break;
        case "publisher":
          queryParams.sortBy = "publisher";
          break;
        case "genre":
          queryParams.sortBy = "genre";
          break;
        default:
          queryParams.sortBy = "created_at";
          break;
      }

      queryParams.sortOrder = requestSortParameters.sortOrder || "asc";
    }

    // Execute the database query with efficient JOINs
    const comicsFromDb = await getComicBooksWithMetadata(queryParams);

    // Determine if there's a next page
    const hasNextPage = comicsFromDb.length > requestQueryParameters.pageSize;
    const comics = hasNextPage
      ? comicsFromDb.slice(0, requestQueryParameters.pageSize)
      : comicsFromDb;

    // Convert to ComicBookWithMetadata by attaching all related data
    const booksWithMetadata: ComicBookWithMetadata[] = [];

    for (const comic of comics) {
      const comicWithMetadata = await attatchMetadataToComicBook(comic);
      booksWithMetadata.push(comicWithMetadata);
    }

    return {
      comics: booksWithMetadata,
      hasNextPage,
      currentPage: requestQueryParameters.page,
      pageSize: requestQueryParameters.pageSize,
      totalResults: comics.length,
      isFiltered: !!(requestFilterParameters.filterProperty &&
        requestFilterParameters.filter),
      isSorted:
        !!(requestSortParameters.sortProperty && requestSortParameters.sort),
    };
  } catch (error) {
    console.error("Error fetching all comic books:", error);
    throw error;
  }
};

/**
 * Get comic book duplicates in the database.
 *
 * @param requestQueryParameters - The query parameters for pagination.
 * @returns A promise that resolves to an array of duplicate comic books.
 * 
 * used by /api/comic-books/duplicates
 */
export const fetchComicDuplicatesInTheDb = async (requestQueryParameters: requestQueryParameters): Promise<ComicBook[]> => {
  // Set default pagination values
  if (!requestQueryParameters.page || requestQueryParameters.page < 1) {
    requestQueryParameters.page = 1;
  }

  if (!requestQueryParameters.pageSize || requestQueryParameters.pageSize < 1) {
    requestQueryParameters.pageSize = DEFAULT_PAGE_SIZE;
  }

  // Calculate offset for pagination
  const offset = (requestQueryParameters.page - 1) *
    requestQueryParameters.pageSize;

  try {
    const duplicates = await getComicDuplicates(offset, requestQueryParameters.pageSize);

    return duplicates;
  } catch (error) {
    console.error("Error fetching comic duplicates:", error);
    throw error;
  }
};


export const fetchTheLatestsComicBooksAdded = async (
  offset: number = 0,
  limit: number = 10,
) => {
  try {
    const result = await getAllComicBooksSortByDate(offset, limit, "desc");
    return result;
  } catch (error) {
    console.error("Error fetching the latest comic books added:", error);
    throw error;
  }
};

// we want to fetch comic books by the first letter of their title
export const fetchComicBooksByLetter = async (
  letter: string,
  offset: number = 0,
  limit: number = 100,
): Promise<ComicBook[]> => {
  const letterFormatted = letter.toLowerCase().trim();

  try {
    const books: ComicBook[] = await getAllComicBooksSortByFileName(
      letterFormatted,
      offset,
      limit,
    );

    return books;
  } catch (error) {
    console.error("Error fetching comic books by letter:", error);
    throw error;
  }
};

export const fetchComicBookMetadataById = async (
  id: number,
): Promise<ComicBookWithMetadata | null> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const comicBook = await getComicBookById(id);
    if (!comicBook) {
      return null;
    }

    const metadata: ComicBookWithMetadata = {
      ...comicBook,
      writers: await getWritersByComicBookId(id),
      pencillers: await getPencillersByComicBookId(id),
      inkers: await getInkersByComicBookId(id),
      letterers: await getLetterersByComicBookId(id),
      editors: await getEditorsByComicBookId(id),
      colorists: await getColoristByComicBookId(id),
      coverArtists: await getCoverArtistsByComicBookId(id),
      publishers: await getPublishersByComicBookId(id),
      imprints: await getImprintsByComicBookId(id),
      genres: await getGenresForComicBook(id),
      characters: await getCharactersByComicBookId(id),
      teams: await getTeamsByComicBookId(id),
      locations: await getLocationsByComicBookId(id),
      storyArcs: await getStoryArcsByComicBookId(id),
      seriesGroups: await getSeriesGroupsByComicBookId(id),
    };

    return metadata;
  } catch (error) {
    console.error("Error fetching comic book metadata:", error);
    throw error;
  }
};

/**
 * Start streaming the comic book file.
 *
 * @param comicId ID of the comic book to stream
 * @param page Page number to stream (1-based)
 * @param acceptHeader Browser's Accept header for format negotiation
 * @param preloadPages Number of additional pages to preload for caching
 */
export const startStreamingComicBookFile = async (
  comicId: number,
  page: number = 1,
  acceptHeader?: string,
  preloadPages: number = 5,
) => {
  // Get the comic book record from the database
  const comic = await getComicBookById(comicId);
  if (!comic) {
    throw new Error("Comic book not found.");
  }

  const filePath = comic.file_path;

  // Check if file exists
  try {
    await Deno.stat(filePath);
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      throw new Error("Comic book file not found on disk.");
    } else {
      throw error;
    }
  }

  // Validate page number
  if (page < 1) {
    throw new Error("Invalid page number requested.");
  }
  if (comic.page_count && page > comic.page_count) {
    throw new Error(
      "Requested page exceeds total number of pages in the comic test.",
    );
  }

  // Determine best output format for browser compatibility
  const targetFormat = determineBestOutputFormat(acceptHeader);
  const formatExtension = targetFormat.split("/")[1];

  // Check if page exists in cache (with correct format)
  const cacheDir = "./cache/pages";
  const comicCacheDir = `${cacheDir}/${comicId}`;
  const cachedPagePath = `${comicCacheDir}/${page}.${formatExtension}`;

  // Create cache directory if it doesn't exist
  await Deno.mkdir(comicCacheDir, { recursive: true });

  let pagePath = cachedPagePath;

  // Check if page is already in cache
  const pageInCache = await checkIfPageInCache(comicId, page, formatExtension);

  if (!pageInCache) {
    console.log(`Page ${page} not in cache, extracting...`);

    // Determine if we should use streaming extraction for large files
    const fileSize = (await Deno.stat(filePath)).size;
    const isLargeFile = fileSize > 100 * 1024 * 1024; // 100MB threshold

    if (isLargeFile) {
      // Use streaming extraction for large files
      const pageRange = Math.min(
        preloadPages,
        comic.page_count || preloadPages,
      );
      const startPage = Math.max(0, page - 1); // Convert to 0-based
      const endPage = Math.min(
        (comic.page_count || page) - 1,
        startPage + pageRange,
      );

      console.log(
        `Large file detected, using streaming extraction for pages ${
          startPage + 1
        }-${endPage + 1}`,
      );

      const extractionResult = await extractComicBookByStreaming(
        filePath,
        undefined, // Use temp directory
        startPage,
        endPage,
      );

      if (extractionResult.success && extractionResult.pages.length > 0) {
        // Process and cache the extracted pages
        for (let i = 0; i < extractionResult.pages.length; i++) {
          const extractedPagePath = extractionResult.pages[i];
          const pageNumber = startPage + i + 1; // Convert back to 1-based
          const outputPath =
            `${comicCacheDir}/${pageNumber}.${formatExtension}`;

          // Convert to browser-compatible format
          const conversionSuccess = await convertImageForBrowser(
            extractedPagePath,
            outputPath,
            targetFormat,
          );

          if (conversionSuccess) {
            console.log(`Cached page ${pageNumber} in ${targetFormat} format`);

            // Set the path for the requested page
            if (pageNumber === page) {
              pagePath = outputPath;
            }
          }
        }

        // Clean up temporary extraction directory
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
      // Use single page extraction for smaller files
      console.log(`Small file, extracting single page ${page}`);

      const extractedPagePath = await extractComicPage(filePath, page - 1); // Convert to 0-based

      if (!extractedPagePath) {
        throw new Error("Failed to extract page from comic archive");
      }

      // Convert to browser-compatible format
      const conversionSuccess = await convertImageForBrowser(
        extractedPagePath,
        cachedPagePath,
        targetFormat,
      );

      if (!conversionSuccess) {
        throw new Error("Failed to convert image to browser-compatible format");
      }

      console.log(`Cached page ${page} in ${targetFormat} format`);
    }

    // Background preloading for better UX (don't await this)
    if (!isLargeFile && preloadPages > 0) {
      preloadAdjacentPages(
        comicId,
        page,
        preloadPages,
        targetFormat,
        comic.page_count || 0,
      )
        .catch((error: unknown) => console.warn(`Preloading failed: ${error}`));
    }
  }

  // Return the path to the cached page
  return {
    pagePath,
    format: targetFormat,
    comicId,
    page,
    cached: pageInCache,
  };
};

export const getComicPagesInfo = async (comicId: number) => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  // check if there is a comicbook with that id
  const comic = await getComicBookById(comicId);
  if (!comic) {
    throw new Error("Comic book not found.");
  }

  const comicPages = await getComicPagesByComicBookId(comicId);

  return {
    comicId,
    totalPages: comic.page_count || comicPages.length,
    pagesInDb: comicPages.length,
    pages: comicPages,
  };
};

export const getNextComicBookId = async (
  currentComicId: number,
): Promise<ComicBook | null> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    // Get the current comic book to find its series and issue number
    const currentComic = await getComicBookById(currentComicId);
    if (!currentComic) {
      throw new Error("Current comic book not found.");
    }

    const seriesId = await getSeriesIdFromComicBook(currentComicId);
    if (!seriesId) {
      return null; // Current comic is not part of a series
    }

    const comicsInSeries = await getComicBooksInSeries(seriesId);
    if (comicsInSeries.length === 0) {
      return null; // No comics found in the series
    }

    // Sort the comics in the series by issue number
    const sortedComics = await Promise.all(
      comicsInSeries.map(async (comicId) => {
        const comic = await getComicBookById(comicId);
        return comic
          ? { id: comic.id, issueNumber: comic.issue_number || 0 }
          : null;
      }),
    );

    // Find the next comic book in the same series with a higher issue number
    const currentIssueNumber = parseInt(currentComic.issue_number || "0", 10) ||
      0;
    const nextComic = sortedComics
      .filter((c): c is { id: number; issueNumber: number } => c !== null)
      .sort((a, b) => a.issueNumber - b.issueNumber)
      .find((c) => c.issueNumber > currentIssueNumber);

    return nextComic ? await getComicBookById(nextComic.id) : null;
  } catch (error) {
    console.error("Error fetching next comic book ID:", error);
    throw new Error("Failed to fetch next comic book ID");
  }
};

export const getPreviousComicBookId = async (
  currentComicId: number,
): Promise<ComicBook | null> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    // Get the current comic book to find its series and issue number
    const currentComic = await getComicBookById(currentComicId);
    if (!currentComic) {
      throw new Error("Current comic book not found.");
    }

    const seriesId = await getSeriesIdFromComicBook(currentComicId);
    if (!seriesId) {
      return null; // Current comic is not part of a series
    }

    const comicsInSeries = await getComicBooksInSeries(seriesId);
    if (comicsInSeries.length === 0) {
      return null; // No comics found in the series
    }

    // Sort the comics in the series by issue number
    const sortedComics = await Promise.all(
      comicsInSeries.map(async (comicId) => {
        const comic = await getComicBookById(comicId);
        return comic
          ? { id: comic.id, issueNumber: comic.issue_number || 0 }
          : null;
      }),
    );

    // Find the previous comic book in the same series with a lower issue number
    const currentIssueNumber = parseInt(currentComic.issue_number || "0", 10) ||
      0;
    const previousComics = sortedComics
      .filter((c): c is { id: number; issueNumber: number } => c !== null)
      .sort((a, b) => b.issueNumber - a.issueNumber) // Sort descending
      .filter((c) => c.issueNumber < currentIssueNumber);

    const previousComic = previousComics.length > 0 ? previousComics[0] : null;

    return previousComic ? await getComicBookById(previousComic.id) : null;
  } catch (error) {
    console.error("Error fetching previous comic book ID:", error);
    throw new Error("Failed to fetch previous comic book ID");
  }
};



export const getComicThumbnails = async (
  comicId: number,
): Promise<ComicBookThumbnail[] | null> => {
  // check if there is a comicbook with that id
  const comic = await getComicBookById(comicId);

  if (!comic) {
    throw new Error("Comic book not found.");
  }

  const comicThumbnails = await getThumbnailsByComicBookId(comicId);
  return comicThumbnails;
};

export const getComicThumbnailByComicIdThumbnailId = async (
  comicId: number,
  thumbnailId: number,
): Promise<ComicBookThumbnail | null> => {
  const comic = await getComicBookById(comicId);

  if (!comic) {
    throw new Error("Comic book not found.");
  }

  const comicThumbnail = await getComicThumbnailById(thumbnailId);
  return comicThumbnail;
};

//FIXME: Updated function to also delete the thumbnail from the filesystem
export const deleteComicsThumbnailById = async (
  comicId: number,
  thumbnailId: number,
): Promise<boolean> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  // check if there is a comicbook with that id
  const comic = await getComicBookById(comicId);
  if (!comic) {
    throw new Error("Comic book not found.");
  }

  // Check if the thumbnail exists
  const thumbnail = await getComicThumbnailById(thumbnailId);
  if (!thumbnail) {
    throw new Error("Comic book thumbnail not found.");
  }

  try {
    await deleteComicBookThumbnail(thumbnailId);
    return true;
  } catch (error) {
    console.error("Error deleting comic book thumbnail:", error);
    throw new Error("Failed to delete comic book thumbnail.");
  }
};

export const createCustomThumbnail = async (
  comicId: number,
  imageData: ArrayBuffer,
  userId: number,
  name?: string,
  description?: string,
): Promise<{ thumbnailId: number; filePath: string }> => {
  // Check if comic exists
  const comic = await getComicBookById(comicId);
  if (!comic) {
    throw new Error("Comic book not found.");
  }

  // Generate filename for the custom thumbnail
  const timestamp = Date.now();
  const filename = `custom_thumbnail_${comicId}_${timestamp}.jpg`;
  const thumbnailDir = `/app/cache/thumbnails/custom`;
  const filePath = `${thumbnailDir}/${filename}`;

  try {
    // Ensure directory exists
    await Deno.mkdir(thumbnailDir, { recursive: true });

    // Write the image data to file
    await Deno.writeFile(filePath, new Uint8Array(imageData));

    // Store in database
    const thumbnailId = await insertCustomComicBookThumbnail(
      comicId,
      filePath,
      userId,
      name,
      description,
    );

    return { thumbnailId, filePath };
  } catch (error) {
    console.error("Error creating custom thumbnail:", error);
    throw new Error("Failed to create custom thumbnail.");
  }
};

export const checkComicReadByUser = async (
  comicId: number,
  userId: number,
): Promise<boolean> => {
  const history: ComicBookHistory | null =
    await getComicBookHistoryByUserAndComic(userId, comicId);
  if (history && history.read === 1) {
    return true;
  }
  return false;
};

export const setComicReadByUser = async (
  comicId: number,
  userId: number,
  read: boolean,
): Promise<boolean> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  // check if there is a comicbook with that id
  const comic = await getComicBookById(comicId);
  if (!comic) {
    throw new Error("Comic book not found.");
  }

  // Check if a history record already exists
  const existingHistory = await getComicBookHistoryByUserAndComic(
    userId,
    comicId,
  );

  if (existingHistory) {
    // Update the existing record
    const readValue = read ? 1 : 0;
    // Update the existing record
    const comicbookHistoryId = await updateComicBookHistory(
      existingHistory.id,
      { read: readValue, last_read_page: null },
    );

    if (!comicbookHistoryId) {
      throw new Error("Failed to update comic book history.");
    }

    if (!existingHistory.id) {
      throw new Error("Failed to update comic book history.");
    }

    return true;
  } else {
    // Create a new history record
    const newHistory = {
      user_id: userId,
      comic_book_id: comicId,
      read: read ? 1 : 0,
      last_read_page: null,
    };
    const comicbookHistoryId = await insertComicBookHistory(newHistory);

    if (!comicbookHistoryId) {
      throw new Error("Failed to create comic book history.");
    }

    return true;
  }
};

export const getRandomComicBook = async (): Promise<ComicBook | null> => {
  try {
    const comicBook = await getRandomBook();
    return comicBook;
  } catch (error) {
    console.error("Error fetching random comic book:", error);
    throw error;
  }
};

// ******************************************************************************
// Helper functions
// ******************************************************************************

/**
 * Check if a page exists in cache with the specified format
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
    return true; // Page exists in cache
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return false; // Page does not exist in cache
    } else {
      throw error; // Some other error occurred
    }
  }
};

/**
 * Preload adjacent pages for better user experience
 */
async function preloadAdjacentPages(
  comicId: number,
  currentPage: number,
  preloadCount: number,
  targetFormat: string,
  totalPages: number,
): Promise<void> {
  const formatExtension = targetFormat.split("/")[1];
  const cacheDir = `./cache/pages/${comicId}`;

  // Calculate pages to preload (next few pages)
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

  // Extract and cache the pages that aren't already cached
  if (pagesToPreload.length > 0) {
    console.log(`Preloading pages: ${pagesToPreload.join(", ")}`);

    const comic = await getComicBookById(comicId);
    if (!comic) return;

    for (const pageNum of pagesToPreload) {
      try {
        const extractedPagePath = await extractComicPage(
          comic.file_path,
          pageNum - 1,
        ); // Convert to 0-based

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
}

/**
 * Determine the best output format based on browser capabilities
 */
function determineBestOutputFormat(acceptHeader?: string): string {
  if (!acceptHeader) {
    return "image/jpeg"; // Default fallback
  }

  // Check what the browser accepts
  if (acceptHeader.includes("image/webp")) {
    return "image/webp"; // Best compression, modern browsers
  }
  if (acceptHeader.includes("image/png")) {
    return "image/png"; // Good quality, universal support
  }
  return "image/jpeg"; // Universal fallback
}

/**
 * Convert image to browser-compatible format if needed
 */
async function convertImageForBrowser(
  inputPath: string,
  outputPath: string,
  targetFormat: string,
): Promise<boolean> {
  try {
    const inputExt = inputPath.toLowerCase().split(".").pop();
    const targetExt = targetFormat.split("/")[1];

    // If already in target format, just copy
    if (inputExt === targetExt) {
      await Deno.copyFile(inputPath, outputPath);
      return true;
    }

    // Use Sharp for conversion - create a simple copy for now
    // TODO: Implement proper format conversion using Sharp when needed
    await Deno.copyFile(inputPath, outputPath);

    return true;
  } catch (error) {
    console.error(`Error converting image format: ${error}`);
    return false;
  }
}

const attatchMetadataToComicBook = async (
  comic: ComicBook,
): Promise<ComicBookWithMetadata> => {
  const metadata: ComicBookWithMetadata = {
    ...comic,
    writers: await getWritersByComicBookId(comic.id),
    pencillers: await getPencillersByComicBookId(comic.id),
    inkers: await getInkersByComicBookId(comic.id),
    letterers: await getLetterersByComicBookId(comic.id),
    editors: await getEditorsByComicBookId(comic.id),
    colorists: await getColoristByComicBookId(comic.id),
    coverArtists: await getCoverArtistsByComicBookId(comic.id),
    publishers: await getPublishersByComicBookId(comic.id),
    imprints: await getImprintsByComicBookId(comic.id),
    genres: await getGenresForComicBook(comic.id),
    characters: await getCharactersByComicBookId(comic.id),
    teams: await getTeamsByComicBookId(comic.id),
    locations: await getLocationsByComicBookId(comic.id),
    storyArcs: await getStoryArcsByComicBookId(comic.id),
    seriesGroups: await getSeriesGroupsByComicBookId(comic.id),
  };

  return metadata;
};
