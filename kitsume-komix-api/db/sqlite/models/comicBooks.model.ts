import { and, asc, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { SQLiteColumn, SQLiteSelect } from "drizzle-orm/sqlite-core";

import { getClient } from "../client.ts";

import {
  comicBookCharactersTable,
  comicBookColoristsTable,
  comicBookCoverArtistsTable,
  comicBookEditorsTable,
  comicBookGenresTable,
  comicBookImprintsTable,
  comicBookInkersTable,
  comicBookLetterersTable,
  comicBookLocationsTable,
  comicBookPencillersTable,
  comicBookPublishersTable,
  comicBookSeriesGroupsTable,
  comicBooksTable,
  comicBookStoryArcsTable,
  comicBookTeamsTable,
  comicBookWritersTable,
  comicCharactersTable,
  comicColoristsTable,
  comicCoverArtistsTable,
  comicEditorsTable,
  comicGenresTable,
  comicImprintsTable,
  comicInkersTable,
  comicLetterersTable,
  comicLocationsTable,
  comicPencillersTable,
  comicPublishersTable,
  comicSeriesBooksTable,
  comicSeriesGroupsTable,
  comicSeriesTable,
  comicStoryArcsTable,
  comicTeamsTable,
  comicWebLinksTable,
  comicWritersTable,
} from "../schema.ts";

import type {
  ComicBook,
  ComicBookFilteringAndSortingParams,
  NewComicBook,
  ComicBookFilterItem,
  ComicSortField,
} from "#types/index.ts";
import type { ComicBookQueryParams } from "#interfaces/index.ts";
import { PAGE_SIZE_DEFAULT } from "../../../constants/index.ts";

/**
 * Exclusive dynamic filtering function specifcally for getComicBooksWithMetadataFilteringSorting
 * This is necessary as the filtering can be applied to any of the fields in the comic book table and we need to dynamically apply it to the query builder.
 * @param filter 
 * @param query
 * @returns the query with the filter applied
 */
const addFilteringToQuery = <T extends SQLiteSelect>(filter: ComicBookFilterItem, query: T): T => {
  const { filterProperty, filterValue } = filter;

  switch (filterProperty) {
    case "id":
      query.where(eq(comicBooksTable.id, Number(filterValue)));
      break;
    case "seriesId":
      query.where(eq(comicSeriesTable.id, Number(filterValue)));
      break;
    case "hash":
      query.where(eq(comicBooksTable.hash, filterValue));
      break;
    case "title":
      query.where(ilike(comicBooksTable.title, `%${filterValue}%`));
      break;
    case "series":
      query.where(ilike(comicBooksTable.series, `%${filterValue}%`));
      break;
    case "issueNumber":
      query.where(eq(comicBooksTable.issueNumber, filterValue));
      break;
    case "volume":
      query.where(eq(comicBooksTable.volume, filterValue));
      break;
    case "alternateSeries":
      query.where(ilike(comicBooksTable.alternateSeries, `%${filterValue}%`));
      break;
    case "alternateIssueNumber":
      query.where(eq(comicBooksTable.alternateIssueNumber, filterValue));
      break;
    case "fileSize":
      query.where(eq(comicBooksTable.fileSize, Number(filterValue)));
      break;
    case "year":
      query.where(eq(comicBooksTable.year, Number(filterValue)));
      break;
    case "month":
      query.where(eq(comicBooksTable.month, Number(filterValue)));
      break;
    case "day":
      query.where(eq(comicBooksTable.day, Number(filterValue)));
      break;
    case "date":
      query.where(eq(comicBooksTable.publicationDate, filterValue));
      break;
    case "publisher":
      query.where(ilike(comicBooksTable.publisher, `%${filterValue}%`));
      break;
    case "publicationDate":
      query.where(eq(comicBooksTable.publicationDate, filterValue));
      break;
    case "scanInfo":
      query.where(ilike(comicBooksTable.scanInfo, `%${filterValue}%`));
      break;
    case "language":
      query.where(ilike(comicBooksTable.language, `%${filterValue}%`));
      break;
    case "format":
      query.where(ilike(comicBooksTable.format, `%${filterValue}%`));
      break;
    case "blackAndWhite":
      query.where(eq(comicBooksTable.blackAndWhite, filterValue === "true" ? 1 : 0));
      break;
    case "manga":
      query.where(eq(comicBooksTable.manga, filterValue === "true" ? 1 : 0));
      break;
    case "readingDirection":
      query.where(ilike(comicBooksTable.readingDirection, `%${filterValue}%`));
      break;
    case "review":
      query.where(ilike(comicBooksTable.review, `%${filterValue}%`));
      break;
    case "ageRating":
      query.where(ilike(comicBooksTable.ageRating, `%${filterValue}%`));
      break;
    case "communityRating":
      query.where(eq(comicBooksTable.communityRating, Number(filterValue)));
      break;
    case "createdAt":
      query.where(eq(comicBooksTable.createdAt, filterValue));
      break;
    case "updatedAt":
      query.where(eq(comicBooksTable.updatedAt, filterValue));
      break;
    case "listLetter":
      query.where(ilike(comicBooksTable.title, `${filterValue}%`));
      break;
  }

  return query;
};

/**
 * Exclusive dynamic sorting function specifcally for getComicBooksWithMetadataFilteringSorting
 * This is necessary as the sorting can be applied to any of the fields in the comic book table and we need to dynamically apply it to the query builder.
 * @param sortProperty 
 * @param sortDirection 
 * @param query 
 * @returns the query with the sorting applied
 */
const addSortingToQuery = <T extends SQLiteSelect>(sortProperty: ComicSortField, sortDirection: string, query: T): T => {
  const direction = sortDirection === "asc" ? asc : desc;

  switch (sortProperty) {
    case "title":
      query.orderBy(direction(comicBooksTable.title));
      break;
    case "issueNumber":
      query.orderBy(direction(comicBooksTable.issueNumber));
      break;
    case "volume":
      query.orderBy(direction(comicBooksTable.volume));
      break;
    case "alternateSeries":
      query.orderBy(direction(comicBooksTable.alternateSeries));
      break;
    case "alternateIssueNumber":
      query.orderBy(direction(comicBooksTable.alternateIssueNumber));
      break;
    case "fileSize":
      query.orderBy(direction(comicBooksTable.fileSize));
      break;
    case "year":
      query.orderBy(direction(comicBooksTable.year));
      break;
    case "month":
      query.orderBy(direction(comicBooksTable.month));
      break;
    case "day":
      query.orderBy(direction(comicBooksTable.day));
      break;
    case "date":
    case "publicationDate":
      query.orderBy(direction(comicBooksTable.publicationDate));
      break;
    case "publisher":
      query.orderBy(direction(comicBooksTable.publisher));
      break;
    case "language":
      query.orderBy(direction(comicBooksTable.language));
      break;
    case "format":
      query.orderBy(direction(comicBooksTable.format));
      break;
    case "blackAndWhite":
      query.orderBy(direction(comicBooksTable.blackAndWhite));
      break;
    case "manga":
      query.orderBy(direction(comicBooksTable.manga));
      break;
    case "readingDirection":
      query.orderBy(direction(comicBooksTable.readingDirection));
      break;
    case "ageRating":
      query.orderBy(direction(comicBooksTable.ageRating));
      break;
    case "communityRating":
      query.orderBy(direction(comicBooksTable.communityRating));
      break;
    case "createdAt":
      query.orderBy(direction(comicBooksTable.createdAt));
      break;
    case "updatedAt":
      query.orderBy(direction(comicBooksTable.updatedAt));
      break;
  }

  return query;
};


/**
 * Gets comic books with metadata filtering and sorting
 * @param serviceDetails - Filtering and sorting parameters
 * @returns Promise resolving to an array of ComicBook objects 
 * 
 * Note: This function can be used to filter and sort on the metadata fields as well but not return them. i.e. we can filter by writer but not return the writer data with the comic book.
 * This metadata must be fetched separately after getting the comic books and attached to the comic book objects upstream.
 */
export const getComicBooksWithMetadataFilteringSorting = async (
  serviceDetails: ComicBookFilteringAndSortingParams,
): Promise<ComicBook[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database client is not initialized");
  }

  const offset = serviceDetails.offset || 0;
  const limit = serviceDetails.limit || PAGE_SIZE_DEFAULT;

  try {
    let query = 
      db.select(
        {
          id: comicBooksTable.id,
          libraryId: comicBooksTable.libraryId,
          filePath: comicBooksTable.filePath,
          hash: comicBooksTable.hash,
          title: comicBooksTable.title,
          series: comicBooksTable.series,
          issueNumber: comicBooksTable.issueNumber,
          count: comicBooksTable.count,
          volume: comicBooksTable.volume,
          alternateSeries: comicBooksTable.alternateSeries,
          alternateIssueNumber: comicBooksTable.alternateIssueNumber,
          alternateCount: comicBooksTable.alternateCount,
          pageCount: comicBooksTable.pageCount,
          fileSize: comicBooksTable.fileSize,
          summary: comicBooksTable.summary,
          notes: comicBooksTable.notes,
          year: comicBooksTable.year,
          month: comicBooksTable.month,
          day: comicBooksTable.day,
          publisher: comicBooksTable.publisher,
          publicationDate: comicBooksTable.publicationDate,
          scanInfo: comicBooksTable.scanInfo,
          createdAt: comicBooksTable.createdAt,
          updatedAt: comicBooksTable.updatedAt,
          language: comicBooksTable.language,
          format: comicBooksTable.format,
          blackAndWhite: comicBooksTable.blackAndWhite,
          manga: comicBooksTable.manga,
          readingDirection: comicBooksTable.readingDirection,
          review: comicBooksTable.review,
          ageRating: comicBooksTable.ageRating,
          communityRating: comicBooksTable.communityRating
        }
      ).from(comicBooksTable)
      .leftJoin(comicSeriesBooksTable, eq(comicBooksTable.id, comicSeriesBooksTable.comicBookId))
      .leftJoin(comicSeriesTable, eq(comicSeriesBooksTable.comicSeriesId, comicSeriesTable.id))
      .leftJoin(comicBookWritersTable, eq(comicBooksTable.id, comicBookWritersTable.comicBookId))
      .leftJoin(comicBookPencillersTable, eq(comicBooksTable.id, comicBookPencillersTable.comicBookId))
      .leftJoin(comicBookInkersTable, eq(comicBooksTable.id, comicBookInkersTable.comicBookId))
      .leftJoin(comicBookLetterersTable, eq(comicBooksTable.id, comicBookLetterersTable.comicBookId))
      .leftJoin(comicBookEditorsTable, eq(comicBooksTable.id, comicBookEditorsTable.comicBookId))
      .leftJoin(comicBookColoristsTable, eq(comicBooksTable.id, comicBookColoristsTable.comicBookId))
      .leftJoin(comicBookCoverArtistsTable, eq(comicBooksTable.id, comicBookCoverArtistsTable.comicBookId))
      .leftJoin(comicBookPublishersTable, eq(comicBooksTable.id, comicBookPublishersTable.comicBookId))
      .leftJoin(comicBookImprintsTable, eq(comicBooksTable.id, comicBookImprintsTable.comicBookId))
      .leftJoin(comicBookGenresTable, eq(comicBooksTable.id, comicBookGenresTable.comicBookId))
      .leftJoin(comicBookStoryArcsTable, eq(comicBooksTable.id, comicBookStoryArcsTable.comicBookId))
      .leftJoin(comicBookSeriesGroupsTable, eq(comicBooksTable.id, comicBookSeriesGroupsTable.comicBookId))
      .leftJoin(comicBookTeamsTable, eq(comicBooksTable.id, comicBookTeamsTable.comicBookId))
      .leftJoin(comicBookCharactersTable, eq(comicBooksTable.id, comicBookCharactersTable.comicBookId))
      .leftJoin(comicWebLinksTable, eq(comicBooksTable.id, comicWebLinksTable.comicBookId))
      .groupBy(comicBooksTable.id)
      .offset(offset)
      .limit(limit)
      .$dynamic();

      if (serviceDetails.sort?.property && serviceDetails.sort.order) {
        query = addSortingToQuery(serviceDetails.sort.property, serviceDetails.sort.order, query);
      }

      if (serviceDetails.filters && serviceDetails.filters.length > 0) {
        query = addFilteringToQuery(serviceDetails.filters[0], query);
      }


    return query;
  } catch (error) {
    console.error(
      "Error fetching comic books with metadata filtering and sorting:",
      error,
    );
    throw error;
  }
};

/**
 * Gets all comic books sorted by creation date
 * @param offset number numberical offset for pagination
 * @param limit number numerical limit for pagination
 * @param sort string | undefined sort order, either 'asc' or 'desc'
 * @returns Promise resolving to an array of ComicBook objects
 */
export const getAllComicBooksSortByDate = async (
  offset: number,
  limit: number,
  sort: string | undefined,
): Promise<ComicBook[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: ComicBook[] = await db.select().from(comicBooksTable).limit(limit).offset(
      offset,
    ).orderBy(
      sort === "asc"
        ? asc(comicBooksTable.createdAt)
        : desc(comicBooksTable.createdAt),
    );

    return result;
  } catch (error) {
    console.error("Error fetching all comic books sorted by date:", error);
    throw error;
  }
};

/**
 * Gets a random comic book from the database  
 * @returns Promise resolving to a ComicBook object or null if none found
 */
export const getRandomBook = async (): Promise<ComicBook | null> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .select()
      .from(comicBooksTable)
      .orderBy(sql`RANDOM()`)
      .limit(1);

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Error fetching random comic book:", error);
    throw error;
  }
};

/**
 * Inserts a new comic book into the database
 * @param comicBook The comic book data to insert
 * @returns The ID of the newly inserted comic book
 */
export const insertComicBook = async (comicBook: NewComicBook): Promise<number> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const insertQuery: { id: number }[] = await db
      .insert(comicBooksTable)
      .values(comicBook)
      .returning({ id: comicBooksTable.id });

    return insertQuery[0].id;
  } catch (error) {
    console.error("Error inserting comic book:", error);
    throw error;
  }
};

/**
 * Gets the comic book by its ID
 * @param id Id of the comic book
 * @returns The comic book object or null if not found
 */
export const getComicBookById = async (
  id: number,
): Promise<ComicBook | null> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: ComicBook[] = await db
      .select()
      .from(comicBooksTable)
      .where(
        eq(comicBooksTable.id, id),
      );

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Error fetching comic book by ID:", error);
    throw error;
  }
};

/**
 * Returns the comic book matching the given file path
 * @param filePath String representing the internal path of the comic book file
 * @returns The comic book object or null if not found
 */
export const getComicBookByFilePath = async (
  filePath: string,
): Promise<ComicBook | null> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: ComicBook[] = await db
      .select()
      .from(comicBooksTable)
      .where(
        eq(comicBooksTable.filePath, filePath),
      );
    
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Error fetching comic book by file path:", error);
    throw error;
  }
};

/**
 * Retrieves comic books by their hash value; note multiple comic books can share the same hash if they are duplicates.
 * @param hash String representing the hash of the comic book
 * @returns An array of comic book objects matching the given hash
 */
export const getComicBooksByHash = async (
  hash: string,
): Promise<ComicBook[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: ComicBook[] = await db
      .select()
      .from(comicBooksTable)
      .where(
        eq(comicBooksTable.hash, hash),
      );

    return result;
  } catch (error) {
    console.error("Error fetching comic books by hash:", error);
    throw error;
  }
};

/**
 * Updates an existing comic book with the given updates
 * @param id the ID of the comic book to update
 * @param updates The fields to update in the comic book
 * @returns A boolean indicating whether the update was successful
 */
export const updateComicBook = async (
  id: number,
  updates: Partial<NewComicBook>,
) => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const updateData: Record<string, unknown> = {};

    // Map all possible fields from NewComicBook type
    if (updates.libraryId !== undefined) {
      updateData.libraryId = updates.libraryId;
    }
    if (updates.filePath !== undefined) {
      updateData.filePath = updates.filePath;
    }
    if (updates.hash !== undefined) updateData.hash = updates.hash;
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.series !== undefined) updateData.series = updates.series;
    if (updates.issueNumber !== undefined) {
      updateData.issueNumber = updates.issueNumber;
    }
    if (updates.count !== undefined) updateData.count = updates.count;
    if (updates.volume !== undefined) updateData.volume = updates.volume;
    if (updates.alternateSeries !== undefined) {
      updateData.alternateSeries = updates.alternateSeries;
    }
    if (updates.alternateIssueNumber !== undefined) {
      updateData.alternateIssueNumber = updates.alternateIssueNumber;
    }
    if (updates.alternateCount !== undefined) {
      updateData.alternateCount = updates.alternateCount;
    }
    if (updates.pageCount !== undefined) {
      updateData.pageCount = updates.pageCount;
    }
    if (updates.summary !== undefined) updateData.summary = updates.summary;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.year !== undefined) updateData.year = updates.year;
    if (updates.month !== undefined) updateData.month = updates.month;
    if (updates.day !== undefined) updateData.day = updates.day;
    if (updates.publisher !== undefined) {
      updateData.publisher = updates.publisher;
    }
    if (updates.publicationDate !== undefined) {
      updateData.publicationDate = updates.publicationDate;
    }
    if (updates.scanInfo !== undefined) {
      updateData.scanInfo = updates.scanInfo;
    }
    if (updates.language !== undefined) updateData.language = updates.language; // Note: keeping schema typo
    if (updates.format !== undefined) updateData.format = updates.format;
    if (updates.blackAndWhite !== undefined) {
      updateData.blackAndWhite = updates.blackAndWhite;
    }
    if (updates.manga !== undefined) updateData.manga = updates.manga;
    if (updates.readingDirection !== undefined) {
      updateData.readingDirection = updates.readingDirection;
    }
    if (updates.review !== undefined) updateData.review = updates.review;
    if (updates.ageRating !== undefined) {
      updateData.ageRating = updates.ageRating;
    }
    if (updates.communityRating !== undefined) {
      updateData.communityRating = updates.communityRating;
    }
    if (updates.fileSize !== undefined) {
      updateData.fileSize = updates.fileSize;
    }

    if (Object.keys(updateData).length === 0) {
      return false;
    }

    const result = await db
      .update(comicBooksTable)
      .set(updateData)
      .where(eq(comicBooksTable.id, id))
      .returning({ id: comicBooksTable.id });

    return result.length > 0;
  } catch (error) {
    console.error("Error updating comic book:", error);
    throw error;
  }
};


/**
 * Gets comic books by their library ID
 * @param libraryId The ID of the library
 * @returns An array of comic book objects belonging to the specified library
 * 
 * TODO: paginate this with new filtering/sorting system
 */
export const getComicBooksByLibrary = async (
  libraryId: number,
): Promise<ComicBook[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: ComicBook[] = await db
      .select()
      .from(comicBooksTable)
      .where(
        eq(comicBooksTable.libraryId, libraryId),
      );

    return result;
  } catch (error) {
    console.error("Error fetching comic books by library:", error);
    throw error;
  }
};

/**
 * Returns comic books associated with a specific series ID
 * @param seriesId The ID of the comic series
 * @returns An array of comic book objects belonging to the specified series
 */
export const getComicBooksBySeriesId = async (
  seriesId: number,
): Promise<ComicBook[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: ComicBook[] = await db
      .select(
        {
          id: comicBooksTable.id,
          libraryId: comicBooksTable.libraryId,
          filePath: comicBooksTable.filePath,
          hash: comicBooksTable.hash,
          title: comicBooksTable.title,
          series: comicBooksTable.series,
          issueNumber: comicBooksTable.issueNumber,
          count: comicBooksTable.count,
          volume: comicBooksTable.volume,
          alternateSeries: comicBooksTable.alternateSeries,
          alternateIssueNumber: comicBooksTable.alternateIssueNumber,
          alternateCount: comicBooksTable.alternateCount,
          pageCount: comicBooksTable.pageCount,
          fileSize: comicBooksTable.fileSize,
          summary: comicBooksTable.summary,
          notes: comicBooksTable.notes,
          year: comicBooksTable.year,
          month: comicBooksTable.month,
          day: comicBooksTable.day,
          publisher: comicBooksTable.publisher,
          publicationDate: comicBooksTable.publicationDate,
          scanInfo: comicBooksTable.scanInfo,
          language: comicBooksTable.language,
          format: comicBooksTable.format,
          blackAndWhite: comicBooksTable.blackAndWhite,
          manga: comicBooksTable.manga,
          readingDirection: comicBooksTable.readingDirection,
          review: comicBooksTable.review,
          ageRating: comicBooksTable.ageRating,
          communityRating: comicBooksTable.communityRating,
          createdAt: comicBooksTable.createdAt,
          updatedAt: comicBooksTable.updatedAt,
        },
      )
      .from(comicBooksTable)
      .innerJoin(
        comicSeriesBooksTable,
        eq(comicBooksTable.id, comicSeriesBooksTable.comicBookId),
      )
      .where(eq(comicSeriesBooksTable.comicSeriesId, seriesId))
      .orderBy(asc(comicBooksTable.issueNumber));

    return result;
  } catch (error) {
    console.error("Error fetching comic books by series:", error);
    throw error;
  }
};

/**
 * Gets comic books by their publisher name
 * @param publisher The String publisher name 
 * @returns An array of comic book objects published by the specified publisher
 * 
 * TODO: Add optional id parameter to get by publisher id instead of name as name may not be unique
 */
export const getComicBooksByPublisher = async (
  publisher: string,
): Promise<ComicBook[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db.select().from(comicBooksTable).where(
      eq(comicBooksTable.publisher, publisher),
    );
    return result;
  } catch (error) {
    console.error("Error fetching comic books by publisher:", error);
    throw error;
  }
};

/**
 * Gets comic books by their publication year
 * @param year The numerical year of publication
 * @returns An array of comic book objects published in the specified year
 */
export const getComicBooksByYear = async (
  year: number,
): Promise<ComicBook[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: ComicBook[] = await db
      .select()
      .from(comicBooksTable)
      .where(
        eq(comicBooksTable.year, year),
      );

    return result;
  } catch (error) {
    console.error("Error fetching comic books by year:", error);
    throw error;
  }
};

/**
 * Searches comic books by matching a query string against multiple fields
 * @param query The search query string to match against title, series, publisher, and summary
 * @returns An array of comic book objects matching the search criteria
 */
export const searchComicBooks = async (query: string): Promise<ComicBook[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const likeQuery: string = `%${query}%`;
    const result: ComicBook[] = await db
      .select()
      .from(comicBooksTable)
      .where(
        eq(comicBooksTable.title, likeQuery) ||
          eq(comicBooksTable.series, likeQuery) ||
          eq(comicBooksTable.publisher, likeQuery) ||
          eq(comicBooksTable.summary, likeQuery),
      );

    return result;
  } catch (error) {
    console.error("Error searching comic books:", error);
    throw error;
  }
};

/**
 * Deletes a comic book from the database by its ID
 * @param id The ID of the comic book to delete
 * @returns A boolean indicating whether the deletion was successful
 */
export const deleteComicBook = async (id: number): Promise<boolean> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { id: number }[] = await db
      .delete(comicBooksTable)
      .where(eq(comicBooksTable.id, id))
      .returning({ id: comicBooksTable.id });

    return result.length > 0;
  } catch (error) {
    console.error("Error deleting comic book:", error);
    throw error;
  }
};

/**
 * Retrieves duplicate comic books grouped by hash with pagination support
 * @param offset The number of records to skip for pagination
 * @param limit The maximum number of records to retrieve
 * @returns An array of comic book objects that have duplicates (multiple books with same hash)
 */
export const getComicDuplicates = async (
  offset: number,
  limit: number,
): Promise<ComicBook[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: ComicBook[] = await db
      .select()
      .from(comicBooksTable)
      .groupBy(comicBooksTable.hash)
      .having(sql`COUNT(*) > 1`)
      .limit(limit)
      .offset(offset);

    return result;
  } catch (error) {
    console.error("Error fetching duplicate comic books:", error);
    throw error;
  }
};

/**
 * Comprehensive query that JOINs all related metadata tables for efficient filtering and sorting
 * @param params Query parameters for filtering, sorting, and pagination
 * @returns A promise that resolves to an array of ComicBook objects with metadata
 */
export const getComicBooksWithMetadata = async (
  params: ComicBookQueryParams = {},
): Promise<ComicBook[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  // Destructure and set default values for query parameters from params
  const {
    offset = 0,
    limit = 20,
    titleFilter,
    seriesFilter,
    writerFilter,
    artistFilter,
    publisherFilter,
    genreFilter,
    characterFilter,
    yearFilter,
    generalFilter,
    sortBy = "created_at",
    sortOrder = "desc",
  } = params;

  try {
    // Now we build up any where conditions we may have based on the filters provided
    const whereConditions: Array<ReturnType<typeof eq> | ReturnType<typeof inArray> | ReturnType<typeof ilike> | ReturnType<typeof or>> = [];

    if (titleFilter) {
      whereConditions.push(
        ilike(comicBooksTable.title, `%${titleFilter}%`),
      );
    }

    if (seriesFilter) {
      whereConditions.push(
        ilike(comicBooksTable.series, `%${seriesFilter}%`),
      );
    }

    if (writerFilter) {
      whereConditions.push(
        ilike(comicWritersTable.name, `%${writerFilter}%`),
      );
    }

    if (artistFilter) {
      whereConditions.push(
        or(
          ilike(comicPencillersTable.name, `%${artistFilter}%`),
          ilike(comicInkersTable.name, `%${artistFilter}%`),
          ilike(comicColoristsTable.name, `%${artistFilter}%`),
          ilike(comicCoverArtistsTable.name, `%${artistFilter}%`),
        ),
      );
    }

    if (publisherFilter) {
      whereConditions.push(
        or(
          ilike(comicBooksTable.publisher, `%${publisherFilter}%`),
          ilike(comicPublishersTable.name, `%${publisherFilter}%`),
        ),
      );
    }

    if (genreFilter) {
      whereConditions.push(
        ilike(comicGenresTable.name, `%${genreFilter}%`),
      );
    }

    if (characterFilter) {
      whereConditions.push(
        ilike(comicCharactersTable.name, `%${characterFilter}%`),
      );
    }

    if (yearFilter) {
      whereConditions.push(
        eq(comicBooksTable.year, yearFilter),
      );
    }

    if (generalFilter) {
      whereConditions.push(
        or(
          ilike(comicBooksTable.title, `%${generalFilter}%`),
          ilike(comicBooksTable.series, `%${generalFilter}%`),
          ilike(comicBooksTable.summary, `%${generalFilter}%`),
          ilike(comicWritersTable.name, `%${generalFilter}%`),
          ilike(comicPencillersTable.name, `%${generalFilter}%`),
          ilike(comicPublishersTable.name, `%${generalFilter}%`),
          ilike(comicGenresTable.name, `%${generalFilter}%`),
          ilike(comicCharactersTable.name, `%${generalFilter}%`),
        ),
      );
    }

    // Then we determine sorting similar to before instead we define the value of orderByColumn dynamically
    let orderByColumn: SQLiteColumn;
    switch (sortBy) {
      case "title":
        orderByColumn = comicBooksTable.title;
        break;
      case "series":
        orderByColumn = comicBooksTable.series;
        break;
      case "issue_number":
        orderByColumn = comicBooksTable.issueNumber;
        break;
      case "publication_year":
        orderByColumn = comicBooksTable.year;
        break;
      case "file_name":
        orderByColumn = comicBooksTable.filePath;
        break;
      case "writer":
        orderByColumn = comicWritersTable.name;
        break;
      case "publisher":
        orderByColumn = comicPublishersTable.name;
        break;
      case "genre":
        orderByColumn = comicGenresTable.name;
        break;
      case "created_at":
        orderByColumn = comicBooksTable.createdAt;
        break;
      case "updated_at":
        orderByColumn = comicBooksTable.updatedAt;
        break;
      default:
        orderByColumn = comicBooksTable.createdAt;
    }

    // Now we build up the query, joining the comic book table with all relevant metadata tables
    const baseQuery = db
      .selectDistinct({
        id: comicBooksTable.id,
        libraryId: comicBooksTable.libraryId,
        filePath: comicBooksTable.filePath,
        hash: comicBooksTable.hash,
        title: comicBooksTable.title,
        series: comicBooksTable.series,
        issueNumber: comicBooksTable.issueNumber,
        count: comicBooksTable.count,
        volume: comicBooksTable.volume,
        alternateSeries: comicBooksTable.alternateSeries,
        alternateIssueNumber: comicBooksTable.alternateIssueNumber,
        alternateCount: comicBooksTable.alternateCount,
        pageCount: comicBooksTable.pageCount,
        fileSize: comicBooksTable.fileSize,
        summary: comicBooksTable.summary,
        notes: comicBooksTable.notes,
        year: comicBooksTable.year,
        month: comicBooksTable.month,
        day: comicBooksTable.day,
        publisher: comicBooksTable.publisher,
        publicationDate: comicBooksTable.publicationDate,
        scanInfo: comicBooksTable.scanInfo,
        language: comicBooksTable.language,
        format: comicBooksTable.format,
        blackAndWhite: comicBooksTable.blackAndWhite,
        manga: comicBooksTable.manga,
        readingDirection: comicBooksTable.readingDirection,
        review: comicBooksTable.review,
        ageRating: comicBooksTable.ageRating,
        communityRating: comicBooksTable.communityRating,
        createdAt: comicBooksTable.createdAt,
        updatedAt: comicBooksTable.updatedAt,
      })
      .from(comicBooksTable)
      // Writers
      .leftJoin(
        comicBookWritersTable,
        eq(comicBooksTable.id, comicBookWritersTable.comicBookId),
      )
      .leftJoin(
        comicWritersTable,
        eq(comicBookWritersTable.comicWriterId, comicWritersTable.id),
      )
      // Pencillers
      .leftJoin(
        comicBookPencillersTable,
        eq(comicBooksTable.id, comicBookPencillersTable.comicBookId),
      )
      .leftJoin(
        comicPencillersTable,
        eq(
          comicBookPencillersTable.comicPencillerId,
          comicPencillersTable.id,
        ),
      )
      // Inkers
      .leftJoin(
        comicBookInkersTable,
        eq(comicBooksTable.id, comicBookInkersTable.comicBookId),
      )
      .leftJoin(
        comicInkersTable,
        eq(comicBookInkersTable.comicInkerId, comicInkersTable.id),
      )
      // Colorists
      .leftJoin(
        comicBookColoristsTable,
        eq(comicBooksTable.id, comicBookColoristsTable.comicBookId),
      )
      .leftJoin(
        comicColoristsTable,
        eq(comicBookColoristsTable.comicColoristId, comicColoristsTable.id),
      )
      // Letterers
      .leftJoin(
        comicBookLetterersTable,
        eq(comicBooksTable.id, comicBookLetterersTable.comicBookId),
      )
      .leftJoin(
        comicLetterersTable,
        eq(comicBookLetterersTable.comicLetterId, comicLetterersTable.id),
      )
      // Editors
      .leftJoin(
        comicBookEditorsTable,
        eq(comicBooksTable.id, comicBookEditorsTable.comicBookId),
      )
      .leftJoin(
        comicEditorsTable,
        eq(comicBookEditorsTable.comicEditorId, comicEditorsTable.id),
      )
      // Cover Artists
      .leftJoin(
        comicBookCoverArtistsTable,
        eq(comicBooksTable.id, comicBookCoverArtistsTable.comicBookId),
      )
      .leftJoin(
        comicCoverArtistsTable,
        eq(
          comicBookCoverArtistsTable.comicCoverArtistId,
          comicCoverArtistsTable.id,
        ),
      )
      // Publishers
      .leftJoin(
        comicBookPublishersTable,
        eq(comicBooksTable.id, comicBookPublishersTable.comicBookId),
      )
      .leftJoin(
        comicPublishersTable,
        eq(
          comicBookPublishersTable.comicPublisherId,
          comicPublishersTable.id,
        ),
      )
      // Imprints
      .leftJoin(
        comicBookImprintsTable,
        eq(comicBooksTable.id, comicBookImprintsTable.comicBookId),
      )
      .leftJoin(
        comicImprintsTable,
        eq(comicBookImprintsTable.comicImprintId, comicImprintsTable.id),
      )
      // Genres
      .leftJoin(
        comicBookGenresTable,
        eq(comicBooksTable.id, comicBookGenresTable.comicBookId),
      )
      .leftJoin(
        comicGenresTable,
        eq(comicBookGenresTable.comicGenreId, comicGenresTable.id),
      )
      // Characters
      .leftJoin(
        comicBookCharactersTable,
        eq(comicBooksTable.id, comicBookCharactersTable.comicBookId),
      )
      .leftJoin(
        comicCharactersTable,
        eq(
          comicBookCharactersTable.comicCharacterId,
          comicCharactersTable.id,
        ),
      )
      // Teams
      .leftJoin(
        comicBookTeamsTable,
        eq(comicBooksTable.id, comicBookTeamsTable.comicBookId),
      )
      .leftJoin(
        comicTeamsTable,
        eq(comicBookTeamsTable.comicTeamId, comicTeamsTable.id),
      )
      // Locations
      .leftJoin(
        comicBookLocationsTable,
        eq(comicBooksTable.id, comicBookLocationsTable.comicBookId),
      )
      .leftJoin(
        comicLocationsTable,
        eq(comicBookLocationsTable.comicLocationId, comicLocationsTable.id),
      )
      // Story Arcs
      .leftJoin(
        comicBookStoryArcsTable,
        eq(comicBooksTable.id, comicBookStoryArcsTable.comicBookId),
      )
      .leftJoin(
        comicStoryArcsTable,
        eq(comicBookStoryArcsTable.comicStoryArcId, comicStoryArcsTable.id),
      )
      // Series Groups
      .leftJoin(
        comicBookSeriesGroupsTable,
        eq(comicBooksTable.id, comicBookSeriesGroupsTable.comicBookId),
      )
      .leftJoin(
        comicSeriesGroupsTable,
        eq(
          comicBookSeriesGroupsTable.comicSeriesGroupId,
          comicSeriesGroupsTable.id,
        ),
      )
      .$dynamic();

    // Apply WHERE conditions if any
    const finalQuery: typeof baseQuery = whereConditions.length > 0
      ? baseQuery.where(and(...whereConditions))
      : baseQuery;

    // Apply ordering and pagination
    const result: ComicBook[] = await finalQuery
      .orderBy(sortOrder === "asc" ? asc(orderByColumn) : desc(orderByColumn))
      .limit(limit)
      .offset(offset);

    return result;
  } catch (error) {
    console.error("Error fetching comic books with metadata:", error);
    throw error;
  }
};
