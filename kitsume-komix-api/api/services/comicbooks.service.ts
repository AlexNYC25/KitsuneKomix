import { getClient } from "#sqlite/client.ts";

import {
  getAllComicBooksSortByDate,
  getComicBookById,
  getComicBooksWithMetadata,
  getComicBooksWithMetadataFilteringSorting,
  getComicDuplicates,
  getRandomBook,
  deleteComicBook
} from "#sqlite/models/comicBooks.model.ts";
import {
  getWritersByComicBookId,
  insertComicWriter,
  linkWriterToComicBook,
  unlinkWritersToComicBook,
} from "#sqlite/models/comicWriters.model.ts";
import {
  getColoristByComicBookId,
  insertComicColorist,
  linkColoristToComicBook,
  unlinkColoristsToComicBook,
} from "#sqlite/models/comicColorists.model.ts";
import {
  getPencillersByComicBookId,
  insertComicPenciller,
  linkPencillerToComicBook,
  unlinkPencillersToComicBook,
} from "#sqlite/models/comicPencillers.model.ts";
import {
  getInkersByComicBookId,
  insertComicInker,
  linkInkerToComicBook,
  unlinkInkersToComicBook,
} from "#sqlite/models/comicInkers.model.ts";
import {
  getLetterersByComicBookId,
  insertComicLetterer,
  linkLettererToComicBook,
  unlinkLetterersToComicBook,
} from "#sqlite/models/comicLetterers.model.ts";
import {
  getEditorsByComicBookId,
  insertComicEditor,
  linkEditorToComicBook,
  unlinkEditorsToComicBook,
} from "#sqlite/models/comicEditors.model.ts";
import {
  getCoverArtistsByComicBookId,
  insertComicCoverArtist,
  linkCoverArtistToComicBook,
  unlinkCoverArtistsToComicBook,
} from "#sqlite/models/comicCoverArtists.model.ts";
import {
  getPublishersByComicBookId,
  insertComicPublisher,
  linkPublisherToComicBook,
  unlinkPublishersToComicBook,
} from "#sqlite/models/comicPublishers.model.ts";
import {
  getImprintsByComicBookId,
  insertComicImprint,
  linkImprintToComicBook,
  unlinkImprintsToComicBook,
} from "#sqlite/models/comicImprints.model.ts";
import {
  getGenresForComicBook,
  insertComicGenre,
  linkGenreToComicBook,
  unlinkGenresToComicBook,
} from "#sqlite/models/comicGenres.model.ts";
import {
  getCharactersByComicBookId,
  insertComicCharacter,
  linkCharacterToComicBook,
  unlinkCharactersToComicBook,
} from "#sqlite/models/comicCharacters.model.ts";
import {
  getTeamsByComicBookId,
  insertComicTeam,
  linkTeamToComicBook,
  unlinkTeamsToComicBook,
} from "#sqlite/models/comicTeams.model.ts";
import {
  getLocationsByComicBookId,
  insertComicLocation,
  linkLocationToComicBook,
  unlinkLocationsToComicBook,
} from "#sqlite/models/comicLocations.model.ts";
import { 
  getStoryArcsByComicBookId,
  unlinkStoryArcsToComicBook,
} from "#sqlite/models/comicStoryArcs.model.ts";
import { 
  getSeriesGroupsByComicBookId,
  unlinkSeriesGroupsToComicBook,
} from "#sqlite/models/comicSeriesGroups.model.ts";
import { getComicPagesByComicBookId } from "#sqlite/models/comicPages.model.ts";
import {
  deleteComicBookThumbnail,
  getComicThumbnailById,
  getThumbnailsByComicBookId,
  insertCustomComicBookThumbnail,
} from "#sqlite/models/comicBookThumbnails.model.ts";
import {
  getComicBooksInSeries,
  getSeriesIdFromComicBook,
} from "#sqlite/models/comicSeries.model.ts";
import {
  getComicBookHistoryByUserAndComic,
  insertComicBookHistory,
  updateComicBookHistory,
} from "#sqlite/models/comicBookHistory.model.ts";

import {
  extractComicBookByStreaming,
  extractComicPage,
} from "#utilities/extract.ts";

import {
  ComicBook,
  ComicBookFilterItem,
  ComicBookHistory,
  ComicBookThumbnail,
  ComicBookMetadataOnly,
  ComicBookWithMetadata,
  ComicBookWithThumbnail,
  // Request parameter types
  RequestPaginationParametersValidated,
  RequestParametersValidated,
  ComicSortField, 
  ComicFilterField,
  RequestFilterParametersValidated,
  RequestSortParametersValidated,
  ComicMetadataUpdateData,
  ComicBookStreamingServiceData,
  ComicBookStreamingServiceResult,
  ComicStoryArc,
  ComicPage,
  ComicBookPagesInfo,
} from "#types/index.ts";

/**
 * Fetch all comic books with related metadata.
 * @param requestQueryParameters
 * @param requestFilterParameters
 * @param requestSortParameters
 * @returns A promise that resolves to an array of ComicBook objects with related metadata
 *
 * used by
 * -  /api/comic-books/all
 * -  /api/comic-books/latest (sorting by the created_at date)
 * -  /api/comic-books/newest (sorting by the publication_date)
 */
export const fetchComicBooksWithRelatedMetadata = async (
  queryData: RequestParametersValidated<ComicSortField, ComicFilterField>
): Promise<ComicBookWithMetadata[]> => {
  try {
    const serviceDataPagination: RequestPaginationParametersValidated = queryData.pagination;
    const serviceDataFilter: RequestFilterParametersValidated<ComicFilterField> | undefined = queryData.filter;
    const serviceDataSort: RequestSortParametersValidated<ComicSortField> = queryData.sort;

    // now we pass these filters + the sorting details to the new optimized database function
    const comicsFromDb: ComicBook[] = await getComicBooksWithMetadataFilteringSorting({
      filters: [serviceDataFilter] as ComicBookFilterItem[],
      sort: {
        property: serviceDataSort.sortProperty,
        order: serviceDataSort.sortOrder,
      },
      offset: serviceDataPagination.pageNumber * serviceDataPagination.pageSize - serviceDataPagination.pageSize,
      limit: serviceDataPagination.pageSize + 1, // Fetch one extra to check for next page
    });

    const comicsWithMetadata: ComicBookWithMetadata[] = [];
    for (let i = 0; i < comicsFromDb.length; i++) {
      const comic = comicsFromDb[i];
      const metadata = await fetchAComicsAssociatedMetadataById(comic.id);
      const comicWithMetadata: ComicBookWithMetadata = {
        ...comic,
        ...metadata,
      }
      comicsWithMetadata.push(comicWithMetadata);
    }

    return comicsWithMetadata;
  } catch (error) {
    console.error("Error fetching comic books with related metadata:", error);
    throw error;
  }
};

/**
 * Fetch associated metadata for a comic book by its ID.
 * @param id - The ID of the comic book.
 * @returns A promise that resolves to the associated metadata of the comic book of type ComicBookMetadataOnly.
 * 
 * used by
 * - /api/comic-books/:id/metadata
 */
export const fetchAComicsAssociatedMetadataById = async (
  id: number,
): Promise<ComicBookMetadataOnly> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {

    const metadata = {
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
}

/**
 * Get comic book duplicates in the database.
 *
 * @param RequestPaginationParametersValidated - The query parameters for pagination.
 * @returns A promise that resolves to an array of duplicate comic books.
 *
 * used by 
 * - /api/comic-books/duplicates
 */
export const fetchComicDuplicatesInTheDb = async (
  requestPaginationParameters: RequestPaginationParametersValidated,
): Promise<ComicBook[]> => {

  // Calculate offset for pagination
  const offset = (requestPaginationParameters.pageNumber - 1) *
    requestPaginationParameters.pageSize;

  try {
    const duplicates = await getComicDuplicates(
      offset,
      requestPaginationParameters.pageSize,
    );

    return duplicates;
  } catch (error) {
    console.error("Error fetching comic duplicates:", error);
    throw error;
  }
};

/**
 * Get random comic books from the database.
 *
 * @param count The number of random comic books to retrieve.
 * @returns An array of random comic books with metadata or null if none found.
 *
 * Used by
 * - /api/comic-books/random
 */
export const fetchRandomComicBook = async (
  requestPaginationParameters: RequestPaginationParametersValidated,
): Promise<ComicBookWithMetadata[] | null> => {
  try {
    const randomComics: ComicBookWithMetadata[] = [];
    
    for (let i = 0; i < requestPaginationParameters.pageSize; i++) {
      const comicBook = await getRandomBook();
      if (comicBook) {
        const comicWithMetadata = await attatchMetadataToComicBook(comicBook);
        randomComics.push(comicWithMetadata);
      }
    }
    return randomComics;
  } catch (error) {
    console.error("Error fetching random comic book:", error);
    throw error;
  }
};

/**
 * Service to update comic book metadata for a single comic book.
 * @param comicId 
 * @param metadataUpdates 
 * @returns boolean indicating success or failure
 * 
 * used by
 * - /api/comic-books/{id}/update
 */
export const updateComicBookMetadata = async (
  comicId: number,
  metadataUpdates: Array<ComicMetadataUpdateData>
): Promise<boolean> => {
  try {
    for (const update of metadataUpdates) {
      const updateType = update.metadataType;
      const replaceExisting = update.replaceExisting ?? false;
      const values = update.values as string[];

      if (!values || values.length === 0) {
        console.warn(`No values provided for ${updateType} on comic ID ${comicId}`);
        continue;
      }

      // Unlink all existing metadata if replaceExisting is true
      if (replaceExisting) {
        try {
          switch (updateType) {
            case "writers":
              await unlinkWritersToComicBook(comicId);
              break;
            case "pencillers":
              await unlinkPencillersToComicBook(comicId);
              break;
            case "inkers":
              await unlinkInkersToComicBook(comicId);
              break;
            case "letterers":
              await unlinkLetterersToComicBook(comicId);
              break;
            case "editors":
              await unlinkEditorsToComicBook(comicId);
              break;
            case "colorists":
              await unlinkColoristsToComicBook(comicId);
              break;
            case "coverArtists":
              await unlinkCoverArtistsToComicBook(comicId);
              break;
            case "publishers":
              await unlinkPublishersToComicBook(comicId);
              break;
            case "imprints":
              await unlinkImprintsToComicBook(comicId);
              break;
            case "genres":
              await unlinkGenresToComicBook(comicId);
              break;
            case "characters":
              await unlinkCharactersToComicBook(comicId);
              break;
            case "teams":
              await unlinkTeamsToComicBook(comicId);
              break;
            case "locations":
              await unlinkLocationsToComicBook(comicId);
              break;
            case "storyArcs":
              await unlinkStoryArcsToComicBook(comicId);
              break;
            case "seriesGroups":
              await unlinkSeriesGroupsToComicBook(comicId);
              break;
          }
        } catch (error) {
          console.error(`Error unlinking ${updateType} from comic book:`, error);
          throw error;
        }
      }

      // Insert new metadata entries and link them to the comic book
      try {
        for (const value of values) {
          let metadataId: number;

          switch (updateType) {
            case "writers": {
              metadataId = await insertComicWriter(value);
              await linkWriterToComicBook(metadataId, comicId);
              break;
            }
            case "pencillers": {
              metadataId = await insertComicPenciller(value);
              await linkPencillerToComicBook(metadataId, comicId);
              break;
            }
            case "inkers": {
              metadataId = await insertComicInker(value);
              await linkInkerToComicBook(metadataId, comicId);
              break;
            }
            case "letterers": {
              metadataId = await insertComicLetterer(value);
              await linkLettererToComicBook(metadataId, comicId);
              break;
            }
            case "editors": {
              metadataId = await insertComicEditor(value);
              await linkEditorToComicBook(metadataId, comicId);
              break;
            }
            case "colorists": {
              metadataId = await insertComicColorist(value);
              await linkColoristToComicBook(metadataId, comicId);
              break;
            }
            case "coverArtists": {
              metadataId = await insertComicCoverArtist(value);
              await linkCoverArtistToComicBook(metadataId, comicId);
              break;
            }
            case "publishers": {
              metadataId = await insertComicPublisher(value);
              await linkPublisherToComicBook(metadataId, comicId);
              break;
            }
            case "imprints": {
              metadataId = await insertComicImprint(value);
              await linkImprintToComicBook(metadataId, comicId);
              break;
            }
            case "genres": {
              metadataId = await insertComicGenre(value);
              await linkGenreToComicBook(metadataId, comicId);
              break;
            }
            case "characters": {
              metadataId = await insertComicCharacter(value);
              await linkCharacterToComicBook(metadataId, comicId);
              break;
            }
            case "teams": {
              metadataId = await insertComicTeam(value);
              await linkTeamToComicBook(metadataId, comicId);
              break;
            }
            case "locations": {
              metadataId = await insertComicLocation(value);
              await linkLocationToComicBook(metadataId, comicId);
              break;
            }
            case "storyArcs": {
              console.warn("Story arcs update not yet implemented");
              break;
            }
            case "seriesGroups": {
              console.warn("Series groups update not yet implemented");
              break;
            }
            default:
              console.warn(`Unknown metadata type: ${updateType}`);
          }
        }
      } catch (error) {
        console.error(`Error updating ${updateType} for comic book:`, error);
        throw error;
      }
    }

    return true;
  } catch (error) {
    console.error("Error updating comic book metadata:", error);
    return false;
  }
};

/**
 * Service to bulk update comic book metadata for multiple comic books using the same set of updates.
 * 
 * @param comicIds 
 * @param metadataUpdates 
 * @returns number of successful updates
 * 
 * used by
 * - /api/comic-books/update-batch
 */
export const updateComicBookMetadataBulk = async (
  comicIds: number[],
  metadataUpdates: Array<ComicMetadataUpdateData>,
): Promise<number> => {
  let numberOfSuccessfulUpdates = 0;

  try {
    for (const comicId of comicIds) {
      const success = await updateComicBookMetadata(comicId, metadataUpdates);
      if (!success) {
        console.error(`Failed to update metadata for comic ID ${comicId}`);
        return numberOfSuccessfulUpdates;
      } else {
        numberOfSuccessfulUpdates++;
      }
    }
    return numberOfSuccessfulUpdates;
  } catch (error) {
    console.error("Error updating comic book metadata in bulk:", error);
    return 0;
  }
};

/**
 * Start streaming the comic book file.
 *
 * @param comicId ID of the comic book to stream
 * @param page Page number to stream (1-based)
 * @param acceptHeader Browser's Accept header for format negotiation
 * @param preloadPages Number of additional pages to preload for caching
 * 
 * used by
 * - /api/comic-books/{id}/stream
 * - /api/comic-books/{id}/stream/{page}
 */
export const startStreamingComicBookFile = async (
  data: ComicBookStreamingServiceData
) => {
  // Get the comic book record from the database
  const comic = await getComicBookById(data.comicId);
  if (!comic) {
    throw new Error("Comic book not found.");
  }

  const filePath = comic.filePath;

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
  if (data.pageNumber < 1) {
    throw new Error("Invalid page number requested.");
  }
  if (comic.pageCount && data.pageNumber > comic.pageCount) {
    throw new Error(
      "Requested page exceeds total number of pages in the comic book.",
    );
  }

  // Determine best output format for browser compatibility
  const targetFormat = determineBestOutputFormat(data.acceptHeader || undefined);
  const formatExtension = targetFormat.split("/")[1];

  // Check if page exists in cache (with correct format)
  const cacheDir = "./cache/pages";
  const comicCacheDir = `${cacheDir}/${data.comicId}`;
  const cachedPagePath = `${comicCacheDir}/${data.pageNumber}.${formatExtension}`;

  // Create cache directory if it doesn't exist
  await Deno.mkdir(comicCacheDir, { recursive: true });

  let pagePath = cachedPagePath;

  // Check if page is already in cache
  const pageInCache = await checkIfPageInCache(data.comicId, data.pageNumber, formatExtension);

  if (!pageInCache) {
    console.log(`Page ${data.pageNumber} not in cache, extracting...`);

    // Determine if we should use streaming extraction for large files
    const fileSize = (await Deno.stat(filePath)).size;
    const isLargeFile = fileSize > 100 * 1024 * 1024; // 100MB threshold

    if (isLargeFile) {
      // Use streaming extraction for large files
      const pageRange = Math.min(
        data.preloadPagesNumber,
        comic.pageCount || data.preloadPagesNumber,
      );
      const startPage = Math.max(0, data.pageNumber - 1); // Convert to 0-based
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
            if (pageNumber === data.pageNumber) {
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
      console.log(`Small file, extracting single page ${data.pageNumber}`);

      const extractedPagePath = await extractComicPage(filePath, data.pageNumber - 1); // Convert to 0-based

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

      console.log(`Cached page ${data.pageNumber} in ${targetFormat} format`);
    }

    // Background preloading for better UX (don't await this)
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
 * Gets information about the pages of a comic book.
 * @param comicId ID of the comic book
 * @returns an object containing total pages, pages in DB, and page details
 * 
 * used by
 * - /api/comic-books/{id}/pages-info
 */
export const getComicPagesInfo = async (comicId: number): Promise<ComicBookPagesInfo> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  // check if there is a comicbook with that id
  const comic: ComicBook | null = await getComicBookById(comicId);
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
 * Gets whether a comic book has been marked as read by a user.
 * @param comicId ID of the comic book
 * @param userId ID of the user
 * @returns boolean indicating if the comic book has been marked as read by the user
 * 
 * used by
 * - /api/comic-books/:id/read
 */
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

/**
 * Marks a comic book as read or unread by a user.
 * @param comicId ID of the comic book
 * @param userId ID of the user we want to set read/unread status for 
 * @param read The boolean value indicating if we want to set the book to be read or unread
 * @returns boolean indicating if this update was successful
 * 
 * used by
 * - /api/comic-books/:id/read
 * - /api/comic-books/:id/unread
 */
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
      { read: readValue, lastReadPage: null },
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
      userId: userId,
      comicBookId: comicId,
      read: read ? 1 : 0,
      lastReadPage: null,
    };
    const comicbookHistoryId = await insertComicBookHistory(newHistory);

    if (!comicbookHistoryId) {
      throw new Error("Failed to create comic book history.");
    }

    return true;
  }
};

/**
 * Service to process the deletion of a comic book and its associated data.
 * 
 * @param comicId ID of the Comic Book to be deleted
 * @returns Boolean representing if the deletion succeeded
 * 
 * used by
 * - /api/comic-books/{id}/delete
 */
export const processComicBookDeletion = async (
  comicId: number,
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

  // Delete associated thumbnails from filesystem and database
  const thumbnails = await getThumbnailsByComicBookId(comicId);
  if (!thumbnails || thumbnails.length === 0) {
    console.log("No thumbnails found for this comic book.");
    return false;
  }

  for (const thumbnail of thumbnails) {
    try {
      await deleteComicBookThumbnail(thumbnail.id);
    } catch (error) {
      console.error(
        `Error deleting thumbnail ID ${thumbnail.id} for comic ID ${comicId}:`,
        error,
      );
    }
  }

  // Additional cleanup logic can be added here (e.g., deleting pages, metadata links, etc.)
  // ok maybe not the metadata links, as we might want to keep those for other comics and even if we don't
  // have comics for those metadata entries right now, we might in the future

  // Finally, delete the comic book record itself
  try {
    await deleteComicBook(comicId);
  } catch (error) {
    console.error(`Error deleting comic book ID ${comicId}:`, error);
    throw error;
  }
  

  return true;
};

/**
 * Get the next comic book ID in the same series based on issue number.
 * @param currentComicId Current comic book ID
 * @returns Next comic book object or null if not found
 * 
 * used by
 * - /api/comic-books/:id/next
 */
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
          ? { id: comic.id, issueNumber: comic.issueNumber || 0 }
          : null;
      }),
    );

    // Find the next comic book in the same series with a higher issue number
    const currentIssueNumber = parseInt(currentComic.issueNumber || "0", 10) ||
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


/**
 * Get the previous comic book ID in the same series based on issue number.
 * @param currentComicId 
 * @returns Previous comic book object or null if not found
 * 
 * used by
 * - /api/comic-books/:id/previous
 */
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
          ? { id: comic.id, issueNumber: comic.issueNumber || 0 }
          : null;
      }),
    );

    // Find the previous comic book in the same series with a lower issue number
    const currentIssueNumber = parseInt(currentComic.issueNumber || "0", 10) ||
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

/**
 * Get the thumbnails for a specific comic book.
 * @param comicId The comic id we want to get the thumbnails for
 * @returns an array of ComicBookThumbnail objects or null if none found
 * 
 * used by
 * - /api/comic-books/:id/thumbnails
 */
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


/**
 * Get the specific thumbnail for a comic book by thumbnail ID.
 * @param comicId The comic id we want to get the thumbnail for
 * @param thumbnailId The specific thumbnail id we want to get
 * @returns the ComicBookThumbnail object or null if not found
 * 
 * used by
 * - /api/comic-books/:id/thumbnails/:thumbId
 */
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

/**
 * Delete a specific thumbnail for a comic book by thumbnail ID.
 * 
 * @param comicId The specific comic id we want to remove the thumbnail for
 * @param thumbnailId The specific thumbnail we want to remove
 * @returns A boolean indicating if the deletion was successful
 * 
 * used by
 * - /api/comic-books/:id/thumbnails/:thumbId
 * 
 * FIXME: Updated function to also delete the thumbnail from the filesystem
 */
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

/**
 * The service to create a custom thumbnail for a specific comic book.
 * 
 * @param comicId The specific comic id we want to create a custom thumbnail for
 * @param imageData The image data for the custom thumbnail
 * @param userId The user id who is creating the custom thumbnail
 * @param name Optional name for the custom thumbnail
 * @param description Optional description for the custom thumbnail
 * @returns The newly created thumbnail's ID and file path
 * 
 * used by
 * - /api/comic-books/:id/thumbnails
 */
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


/**
 * Compiles the comic book data along with its thumbnail URL.
 * 
 * @param comicId The Comic book id who's data we want to attatch it's thumbnail data
 * @returns an object containing the comic book data along with the thumbnail URL or null if comic not found
 * 
 * Note: currently only used by the comic series service, may not be needed anymore or be moved elsewhere
 */
export const attachThumbnailToComicBook = async (
  comicId: number,
): Promise<ComicBookWithThumbnail | null> => {
  const comic: ComicBook | null = await getComicBookById(comicId);
  if (!comic) {
    return null;
  }

  const thumbnails: Array<ComicBookThumbnail> | null =
    await getThumbnailsByComicBookId(comicId);
  const comicWithThumbnail: ComicBookWithThumbnail = {
    ...comic,
    thumbnailUrl: thumbnails && thumbnails.length > 0
      ? `/api/image/thumbnails/${thumbnails[0].filePath.split("/").pop()}`
      : undefined,
  };

  return comicWithThumbnail;
};

/**
 * Get the readlists/comic story arcs that a specific comic book belongs to.
 * 
 * @param comicId The comic in question we want to see what readlists/comic story arcs it belongs to
 * @returns An array of comic story arc objects the comic belongs to
 */
export const getTheReadlistsContainingComicBook = async (
  comicId: number,
): Promise<ComicStoryArc[]> => {
  const readlists: ComicStoryArc[] = await getStoryArcsByComicBookId(comicId);

  if (!readlists || readlists.length === 0) {
    return [];
  }

  return readlists;
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
const preloadAdjacentPages = async (
  comicId: number,
  currentPage: number,
  preloadCount: number,
  targetFormat: string,
  totalPages: number,
): Promise<void> => {
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
          comic.filePath,
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
const determineBestOutputFormat = (acceptHeader?: string): string => {
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
const convertImageForBrowser = async (
  inputPath: string,
  outputPath: string,
  targetFormat: string,
): Promise<boolean> => {
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

/**
 * Attaches metadata to a comic book object.
 * @param comic The comic book object to which metadata will be attached.
 * @returns A promise that resolves to a comic book object with attached metadata.
 */
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
