import { apiLogger } from "#logger/loggers.ts";

import { 
  assembleComicBookMetadataBatch, 
  assembleComicBookThumbnailsBatch, 
  assembleComicBookReadStatusBatch 
} from "#modules/comics/index.ts";

import {
  deleteComicBook,
  getComicBookById as dbGetComicBookById,
  getComicBooksWithMetadataFilteringSorting,
  getComicDuplicates,
  getRandomBook,
} from "#infrastructure/db/sqlite/models/comicBooks.model.ts";
import {
  getThumbnailsByComicBookId
} from "#infrastructure/db/sqlite/models/comicBookThumbnails.model.ts";
import { getFileNameFromPath } from "#utilities/file.ts";

import {
  getWritersByComicBookId,
  getPencilersByComicBookId,
  getInkersByComicBookId,
  getLetterersByComicBookId,
  getEditorsByComicBookId,
  getColoristByComicBookId,
  getCoverArtistsByComicBookId,
  getPublishersByComicBookId,
  getImprintsByComicBookId,
  getGenresForComicBook,
  getCharactersByComicBookId,
  getTeamsByComicBookId,
  getLocationsByComicBookId,
  getStoryArcsByComicBookId,
} from "#infrastructure/db/sqlite/models/comicMetadataImports.ts";

import type {
  ComicBook,
  ComicBookFilterItem,
  ComicBookWithMetadata,
  ComicFilterField,
  ComicSortField,
  RequestPaginationParametersValidated,
  RequestParametersValidated,
  RequestSortParametersValidated,
} from "#types/index.ts";

/**
 * Fetch all comic books with related metadata.
 *
 * Retrieves comic books with pagination, sorting, and filtering support.
 * Also fetches thumbnails and metadata for each comic book.
 *
 * @param queryData - The validated query parameters for pagination, sorting, and filtering
 * @returns A promise that resolves to an array of ComicBookWithMetadata objects
 *
 * @example
 * const comics = await fetchComicBooksWithRelatedMetadata({
 *   pagination: { pageNumber: 1, pageSize: 20 },
 *   sort: { sortProperty: 'title', sortOrder: 'asc' },
 *   filter: { filterProperty: 'genre', filterValue: 'Action' }
 * });
 *
 * @usedBy
 * - /api/comic-books/all
 * - /api/comic-books/latest
 * - /api/comic-books/newest
 * - /api/comic-books/duplicates
 */
export const fetchComicBooksWithRelatedMetadata = async (
  queryData: RequestParametersValidated<ComicSortField, ComicFilterField>,
  userId: number
): Promise<ComicBookWithMetadata[]> => {
  try {
    const serviceDataPagination: RequestPaginationParametersValidated =
      queryData.pagination;

    // Prefer the multi-filter array when provided, fall back to the legacy single filter.
    const resolvedFilters: ComicBookFilterItem[] = queryData.filters
      ? queryData.filters as ComicBookFilterItem[]
      : queryData.filter
      ? [queryData.filter] as ComicBookFilterItem[]
      : [];

    const serviceDataSort: RequestSortParametersValidated<ComicSortField> =
      queryData.sort;

    
    // Fetch comic books with applied filters, sorting, and pagination.
    // Note: This initial fetch does not include metadata or thumbnails.
    const comicsFromDb: ComicBook[] =
      await getComicBooksWithMetadataFilteringSorting({
        filters: resolvedFilters,
        sort: {
          property: serviceDataSort.sortProperty,
          order: serviceDataSort.sortOrder,
        },
        offset:
          (serviceDataPagination.pageNumber - 1) *
          serviceDataPagination.pageSize,
        limit: serviceDataPagination.pageSize + 1,
      });

    const comicBooksWithMetadata: Partial<ComicBookWithMetadata>[] = await assembleComicBookMetadataBatch(comicsFromDb);

    const comicBooksWithThumbnails: Partial<ComicBookWithMetadata>[] = await assembleComicBookThumbnailsBatch(comicBooksWithMetadata);

    const comicBooksWithUserHistory: Partial<ComicBookWithMetadata>[] = await assembleComicBookReadStatusBatch(comicBooksWithThumbnails, userId!);

    // now we verify the final structure is a full ComicBookWithMetadata for the return type, if not we throw an error
    const finalComicBooksWithMetadata: ComicBookWithMetadata[] = comicBooksWithUserHistory.map((comic) => {
      if (!comic.id || !comic.title) {
        throw new Error("Invalid comic book data: missing required fields.");
      }
      return comic as ComicBookWithMetadata;
    });

    return finalComicBooksWithMetadata;
  } catch (error) {
    apiLogger.error("Error fetching comic books with related metadata:" + error);
    throw error;
  }
};

/**
 * Fetch duplicate comic books from the database.
 *
 * Identifies comic books that share the same hash value, indicating potential duplicates.
 *
 * @param requestPaginationParameters - Pagination parameters containing page number and size
 * @returns A promise that resolves to an array of ComicBook objects that are duplicates
 *
 * @example
 * const duplicates = await fetchComicDuplicatesInTheDb({
 *   pageNumber: 1,
 *   pageSize: 10
 * });
 *
 * @usedBy
 * - /api/comic-books/duplicates
 */
export const fetchComicDuplicatesInTheDb = async (
  requestPaginationParameters: RequestPaginationParametersValidated,
): Promise<ComicBook[]> => {
  const offset = (requestPaginationParameters.pageNumber - 1) *
    requestPaginationParameters.pageSize;

  try {
    const duplicates = await getComicDuplicates(
      offset,
      requestPaginationParameters.pageSize,
    );

    return duplicates;
  } catch (error) {
    apiLogger.error("Error fetching comic duplicates:" + error);
    throw error;
  }
};

/**
 * Fetch random comic books from the database.
 *
 * Retrieves a specified number of random comic books, each with full metadata attached.
 *
 * @param requestPaginationParameters - Pagination parameters where pageSize determines count
 * @returns A promise that resolves to an array of ComicBookWithMetadata or null if none found
 *
 * @example
 * const randomComics = await fetchRandomComicBook({
 *   pageNumber: 1,
 *   pageSize: 5
 * });
 *
 * @usedBy
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
        const comicWithMetadata = await attachMetadataToComicBook(comicBook);
        randomComics.push(comicWithMetadata);
      }
    }
    return randomComics;
  } catch (error) {
    apiLogger.error("Error fetching random comic book:" + error);
    throw error;
  }
};

/**
 * Fetch a single comic book by its ID.
 *
 * @param comicId - The unique identifier of the comic book
 * @returns A promise that resolves to the ComicBook or null if not found
 *
 * @example
 * const comic = await getComicBookById(123);
 *
 * @usedBy
 * - Various internal service functions
 */
export const getComicBookById = async (
  comicId: number,
): Promise<ComicBook | null> => {
  try {
    const comic = await dbGetComicBookById(comicId);
    return comic;
  } catch (error) {
    apiLogger.error("Error fetching comic book by ID:" + error);
    throw error;
  }
};

/**
 * Process the deletion of a comic book.
 *
 * Validates the comic exists and removes it from the database.
 * Note: Associated data like thumbnails and metadata links are handled separately.
 *
 * @param comicId - The unique identifier of the comic book to delete
 * @returns A promise that resolves to true if deletion succeeded
 * @throws Error if comic book not found or deletion fails
 *
 * @example
 * const success = await processComicBookDeletion(123);
 *
 * @usedBy
 * - /api/comic-books/{id}/delete
 */
export const processComicBookDeletion = async (
  comicId: number,
): Promise<boolean> => {
  const comic = await dbGetComicBookById(comicId);

  if (!comic) {
    throw new Error("Comic book not found.");
  }

  try {
    await deleteComicBook(comicId);
  } catch (error) {
    apiLogger.error(`Error deleting comic book ID ${comicId}:` + error);
    throw error;
  }

  return true;
};

/**
 * Attach thumbnail URL to a comic book.
 *
 * Retrieves the primary thumbnail for a comic book and formats it as an API URL.
 *
 * @param comicId - The unique identifier of the comic book
 * @returns A promise that resolves to comic ID with thumbnail URL, or null if not found
 *
 * @example
 * const result = await attachThumbnailToComicBook(123);
 * // Returns: { id: 123, thumbnailUrl: '/api/image/thumbnails/cover.jpg' }
 *
 * @usedBy
 * - comicSeries.service.ts for series thumbnail display
 */
export const attachThumbnailToComicBook = async (
  comicId: number,
): Promise<{ id: number; thumbnailUrl?: string } | null> => {
  const comic = await dbGetComicBookById(comicId);
  if (!comic) {
    return null;
  }

  const thumbnails = await getThumbnailsByComicBookId(comicId);
  return {
    id: comic.id,
    thumbnailUrl: thumbnails && thumbnails.length > 0
      ? `/api/image/thumbnails/${getFileNameFromPath(thumbnails[0].filePath)}`
      : undefined,
  };
};

/**
 * Internal helper: Attach metadata to a comic book.
 *
 * Fetches all metadata associations for a comic book (writers, artists, etc.).
 *
 * @param comic - The comic book to attach metadata to
 * @returns A promise that resolves to ComicBookWithMetadata
 */
const attachMetadataToComicBook = async (
  comic: ComicBook,
): Promise<ComicBookWithMetadata> => {
  const metadata: ComicBookWithMetadata = {
    ...comic,
    writers: await getWritersByComicBookId(comic.id),
    pencilers: await getPencilersByComicBookId(comic.id),
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
    read: false, // default value; actual read status should be attached separately based on user
    lastReadPage: undefined, // default value; actual last read page should be attached separately based on user
  };

  return metadata;
};