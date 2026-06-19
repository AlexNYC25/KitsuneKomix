import { and, asc, desc, eq, ilike, inArray, sql } from "drizzle-orm";
import type { SQL } from "drizzle-orm";
import type { SQLiteSelect } from "drizzle-orm/sqlite-core";

import { getClient } from "../client.ts";
import { dbLogger } from "#logger/loggers.ts";

import {
  comicBookCharactersTable,
  comicBookColoristsTable,
  comicBookCoverArtistsTable,
  comicBookEditorsTable,
  comicBookGenresTable,
  comicBookLetterersTable,
  comicBookLocationsTable,
  comicBookPencilersTable,
  comicBookPublishersTable,
  comicBookTeamsTable,
  comicBookWritersTable,
  comicBooksTable,
  comicLibrariesSeriesTable,
  comicLibrariesTable,
  comicSeriesBooksTable,
  comicSeriesTable,
} from "#infrastructure/db/sqlite/schemas/index.ts";

import type {
  ComicSeries,
  ComicSeriesFilteringAndSortingParams,
  ComicSeriesFilterItem,
  ComicSeriesSortField,
  NewComicSeries,
} from "#types/index.ts";

import {
  env
} from "#config/env.ts";

/**
 * Builds a Drizzle SQL condition for a single ComicSeriesFilterItem.
 *
 * Metadata filters (genreId, characterId, etc.) use EXISTS subqueries through the
 * comic_series_books junction table so no extra top-level JOINs are needed.
 */
const buildFilterCondition = (
  db: ReturnType<typeof getClient>["db"],
  filter: ComicSeriesFilterItem,
): SQL | undefined => {
  if (!db) return undefined;
  const { filterProperty, filterValue } = filter;

  switch (filterProperty) {
    case "id":
      return eq(comicSeriesTable.id, Number(filterValue));
    case "name":
      return ilike(comicSeriesTable.name, `%${filterValue}%`);
    case "description":
      return ilike(comicSeriesTable.description, `%${filterValue}%`);
    case "libraryId":
      return eq(comicLibrariesTable.id, Number(filterValue));
    case "letter":
      return ilike(comicSeriesTable.name, `${filterValue}%`);
    case "year":
      return inArray(
        comicSeriesTable.id,
        db
          .select({ comicSeriesId: comicSeriesBooksTable.comicSeriesId })
          .from(comicSeriesBooksTable)
          .innerJoin(comicBooksTable, eq(comicSeriesBooksTable.comicBookId, comicBooksTable.id))
          .where(eq(comicBooksTable.year, Number(filterValue))),
      );
    case "genreId":
      return inArray(
        comicSeriesTable.id,
        db
          .select({ comicSeriesId: comicSeriesBooksTable.comicSeriesId })
          .from(comicSeriesBooksTable)
          .innerJoin(comicBookGenresTable, eq(comicSeriesBooksTable.comicBookId, comicBookGenresTable.comicBookId))
          .where(eq(comicBookGenresTable.comicGenreId, Number(filterValue))),
      );
    case "characterId":
      return inArray(
        comicSeriesTable.id,
        db
          .select({ comicSeriesId: comicSeriesBooksTable.comicSeriesId })
          .from(comicSeriesBooksTable)
          .innerJoin(comicBookCharactersTable, eq(comicSeriesBooksTable.comicBookId, comicBookCharactersTable.comicBookId))
          .where(eq(comicBookCharactersTable.comicCharacterId, Number(filterValue))),
      );
    case "teamId":
      return inArray(
        comicSeriesTable.id,
        db
          .select({ comicSeriesId: comicSeriesBooksTable.comicSeriesId })
          .from(comicSeriesBooksTable)
          .innerJoin(comicBookTeamsTable, eq(comicSeriesBooksTable.comicBookId, comicBookTeamsTable.comicBookId))
          .where(eq(comicBookTeamsTable.comicTeamId, Number(filterValue))),
      );
    case "locationId":
      return inArray(
        comicSeriesTable.id,
        db
          .select({ comicSeriesId: comicSeriesBooksTable.comicSeriesId })
          .from(comicSeriesBooksTable)
          .innerJoin(comicBookLocationsTable, eq(comicSeriesBooksTable.comicBookId, comicBookLocationsTable.comicBookId))
          .where(eq(comicBookLocationsTable.comicLocationId, Number(filterValue))),
      );
    case "writerId":
      return inArray(
        comicSeriesTable.id,
        db
          .select({ comicSeriesId: comicSeriesBooksTable.comicSeriesId })
          .from(comicSeriesBooksTable)
          .innerJoin(comicBookWritersTable, eq(comicSeriesBooksTable.comicBookId, comicBookWritersTable.comicBookId))
          .where(eq(comicBookWritersTable.comicWriterId, Number(filterValue))),
      );
    case "pencilerId":
      return inArray(
        comicSeriesTable.id,
        db
          .select({ comicSeriesId: comicSeriesBooksTable.comicSeriesId })
          .from(comicSeriesBooksTable)
          .innerJoin(comicBookPencilersTable, eq(comicSeriesBooksTable.comicBookId, comicBookPencilersTable.comicBookId))
          .where(eq(comicBookPencilersTable.comicPencilerId, Number(filterValue))),
      );
    case "publisherId":
      return inArray(
        comicSeriesTable.id,
        db
          .select({ comicSeriesId: comicSeriesBooksTable.comicSeriesId })
          .from(comicSeriesBooksTable)
          .innerJoin(comicBookPublishersTable, eq(comicSeriesBooksTable.comicBookId, comicBookPublishersTable.comicBookId))
          .where(eq(comicBookPublishersTable.comicPublisherId, Number(filterValue))),
      );
    case "coloristId":
      return inArray(
        comicSeriesTable.id,
        db
          .select({ comicSeriesId: comicSeriesBooksTable.comicSeriesId })
          .from(comicSeriesBooksTable)
          .innerJoin(comicBookColoristsTable, eq(comicSeriesBooksTable.comicBookId, comicBookColoristsTable.comicBookId))
          .where(eq(comicBookColoristsTable.comicColoristId, Number(filterValue))),
      );
    case "lettererId":
      return inArray(
        comicSeriesTable.id,
        db
          .select({ comicSeriesId: comicSeriesBooksTable.comicSeriesId })
          .from(comicSeriesBooksTable)
          .innerJoin(comicBookLetterersTable, eq(comicSeriesBooksTable.comicBookId, comicBookLetterersTable.comicBookId))
          .where(eq(comicBookLetterersTable.comicLettererId, Number(filterValue))),
      );
    case "editorId":
      return inArray(
        comicSeriesTable.id,
        db
          .select({ comicSeriesId: comicSeriesBooksTable.comicSeriesId })
          .from(comicSeriesBooksTable)
          .innerJoin(comicBookEditorsTable, eq(comicSeriesBooksTable.comicBookId, comicBookEditorsTable.comicBookId))
          .where(eq(comicBookEditorsTable.comicEditorId, Number(filterValue))),
      );
    case "coverArtistId":
      return inArray(
        comicSeriesTable.id,
        db
          .select({ comicSeriesId: comicSeriesBooksTable.comicSeriesId })
          .from(comicSeriesBooksTable)
          .innerJoin(comicBookCoverArtistsTable, eq(comicSeriesBooksTable.comicBookId, comicBookCoverArtistsTable.comicBookId))
          .where(eq(comicBookCoverArtistsTable.comicCoverArtistId, Number(filterValue))),
      );
    default:
      return undefined;
  }
};

/**
 * Exclusive dynamic sorting function specifcally for getComicSeriesWithMetadataFilteringSorting
 * This is necessary as the sorting can be applied to any of the fields in the comic series table and we need to dynamically apply it to the query builder.
 * @param sortProperty
 * @param sortDirection
 * @param query
 * @returns the query with the sorting applied
 */
const addSortingToQuery = <T extends SQLiteSelect>(
  sortProperty: ComicSeriesSortField,
  sortDirection: string,
  query: T,
): T => {
  const direction = sortDirection === "asc" ? asc : desc;

  switch (sortProperty) {
    case "id":
      query.orderBy(direction(comicSeriesTable.id));
      break;
    case "name":
      query.orderBy(direction(comicSeriesTable.name));
      break;
    case "createdAt":
      query.orderBy(direction(comicSeriesTable.createdAt));
      break;
    case "updatedAt":
      query.orderBy(direction(comicSeriesTable.updatedAt));
      break;
    case "publicationDate":
      // Sort series by the publication date of their first issue (lowest issue number).
      query.orderBy(
        direction(
          sql`(
            SELECT cb.publication_date
            FROM comic_series_books csb
            JOIN comic_books cb ON csb.comic_book_id = cb.id
            WHERE csb.comic_series_id = ${comicSeriesTable.id}
            ORDER BY CAST(cb.issue_number AS REAL), cb.issue_number ASC
            LIMIT 1
          )`,
        ),
      );
      break;
    case "seriesGroupPosition":
      query.orderBy(
        direction(
          sql`(
            SELECT MIN(cbsg.position)
            FROM comic_series_books csb
            JOIN comic_book_series_groups cbsg ON csb.comic_book_id = cbsg.comic_book_id
            WHERE csb.comic_series_id = ${comicSeriesTable.id}
          )`,
        ),
      );
      break;
  }

  return query;
};

/**
 * Gets comic series with metadata filtering and sorting
 * @param serviceDetails - Filtering and sorting parameters
 * @returns Promise resolving to an array of ComicSeries objects
 *
 * Note: This function can be used to filter and sort on the metadata fields as well but not return them. i.e. we can filter by writer but not return the writer data with the comic book.
 * This metadata must be fetched separately after getting the comic books and attached to the comic book objects upstream.
 */
export const getComicSeriesWithMetadataFilteringSorting = async (
  serviceDetails: ComicSeriesFilteringAndSortingParams,
): Promise<ComicSeries[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database client is not initialized");
  }

  const offset = serviceDetails.offset || 0;
  const limit = serviceDetails.limit || env.PAGE_SIZE;

  try {
    let query = db.select(
      {
        id: comicSeriesTable.id,
        name: comicSeriesTable.name,
        description: comicSeriesTable.description,
        folderPath: comicSeriesTable.folderPath,
        createdAt: comicSeriesTable.createdAt,
        updatedAt: comicSeriesTable.updatedAt,
      },
    ).from(comicSeriesTable)
      .leftJoin(
        comicLibrariesSeriesTable,
        eq(comicSeriesTable.id, comicLibrariesSeriesTable.comicSeriesId)
      )
      .leftJoin(
        comicLibrariesTable,
        eq(comicLibrariesSeriesTable.libraryId, comicLibrariesTable.id)
      )
      .groupBy(comicSeriesTable.id)
      .offset(offset)
      .limit(limit)
      .$dynamic();

    if (serviceDetails.sort?.property && serviceDetails.sort.order) {
      query = addSortingToQuery(
        serviceDetails.sort.property,
        serviceDetails.sort.order,
        query,
      );
    }

    if (serviceDetails.filters && serviceDetails.filters.length > 0) {
      const conditions: SQL[] = serviceDetails.filters
        .map((filter) => buildFilterCondition(db, filter as ComicSeriesFilterItem))
        .filter((c): c is SQL => c !== undefined);

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }

    return await query;
  } catch (error) {
    dbLogger.error("Error fetching comic series with metadata filtering and sorting:" + error);
    throw error;
  }
};

/**
 * Inserts a new comic series into the database
 *
 * used by the internal worker
 *
 * @param seriesData The series data to insert including name, description, and folder path
 * @returns The ID of the newly inserted or existing series
 */
export const insertComicSeries = async (
  seriesData: NewComicSeries,
): Promise<number> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { id: number }[] = await db
      .insert(comicSeriesTable)
      .values(seriesData)
      .onConflictDoNothing()
      .returning({ id: comicSeriesTable.id });

    // If result is empty, it means the series already exists due to onConflictDoNothing
    if (result.length === 0) {
      // Find the existing series by folder_path (which should be unique)
      if (seriesData.folderPath) {
        const existingSeries: { id: number }[] = await db
          .select({ id: comicSeriesTable.id })
          .from(comicSeriesTable)
          .where(eq(comicSeriesTable.folderPath, seriesData.folderPath));

        if (existingSeries.length > 0) {
          dbLogger.info(
            `Comic series already exists at path: ${seriesData.folderPath}, returning existing ID: ${
              existingSeries[0].id
            }`,
          );
          return existingSeries[0].id;
        }
      }

      throw new Error(
        `Failed to insert comic series and could not find existing series. Data: ${
          JSON.stringify(seriesData)
        }`,
      );
    }

    return result[0].id;
  } catch (error) {
    dbLogger.error("Error inserting comic series:" + error);
    throw error;
  }
};

/**
 * Adds a comic series to a library by creating a relationship
 *
 * Used by the internal worker
 *
 * @param seriesId The ID of the series
 * @param libraryId The ID of the library
 * @returns True if the series was added, false if relationship already exists
 */
export const insertComicSeriesIntoLibrary = async (
  seriesId: number,
  libraryId: number,
): Promise<boolean> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { id: number }[] = await db
      .insert(comicLibrariesSeriesTable)
      .values({
        comicSeriesId: seriesId,
        libraryId: libraryId,
      })
      .onConflictDoNothing()
      .returning({ id: comicLibrariesSeriesTable.id });

    return result.length > 0;
  } catch (error) {
    dbLogger.error("Error inserting comic series into library:" + error);
    throw error;
  }
};

/**
 * Retrieves a comic series by folder path
 *
 * used by the internal worker
 *
 * @param path The folder path of the series
 * @returns The ComicSeries object, or null if not found
 */
export const getComicSeriesByPath = async (
  folderPath: string,
): Promise<ComicSeries | null> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: ComicSeries[] = await db
      .select()
      .from(comicSeriesTable)
      .where(
        eq(comicSeriesTable.folderPath, folderPath),
      );

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    dbLogger.error("Error fetching comic series by path:" + error);
    throw error;
  }
};

/**
 * Adds a comic book to a series by creating a relationship
 *
 * used by the internal worker
 *
 * @param seriesId The ID of the series
 * @param comicBookId The ID of the comic book
 * @returns void
 */
export const addComicBookToSeries = async (
  seriesId: number,
  comicBookId: number,
): Promise<boolean> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { id: number }[] = await db
      .insert(comicSeriesBooksTable)
      .values({
        comicSeriesId: seriesId,
        comicBookId: comicBookId,
      })
      .onConflictDoNothing()
      .returning({ id: comicSeriesBooksTable.id });

    return result.length > 0;
  } catch (error) {
    dbLogger.error("Error adding comic book to series:" + error);
    throw error;
  }
};

/**
 * Retrieves the series ID for a specific comic book
 *
 * Used by functions in the comic books services
 *
 * @param comicBookId The ID of the comic book
 * @returns The series ID, or null if the comic book is not in a series
 */
export const getSeriesIdFromComicBook = async (
  comicBookId: number,
): Promise<number | null> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: {
      id: number;
      comicSeriesId: number;
      comicBookId: number;
      createdAt: string;
      updatedAt: string;
    }[] = await db
      .select()
      .from(comicSeriesBooksTable)
      .where(eq(comicSeriesBooksTable.comicBookId, comicBookId));

    return result.length > 0 ? result[0].comicSeriesId : null;
  } catch (error) {
    dbLogger.error("Error fetching series ID from comic book ID:" + error);
    throw error;
  }
};

/**
 * DEPRECATED: Currently just used by some functions in the comic books service, check if they functions have been updated to not
 * use this function and if so remove this function
 * Retrieves all comic book IDs in a specific series
 * @param seriesId The ID of the series
 * @returns An array of comic book IDs in the series
 */
export const getComicBooksInSeries = async (
  seriesId: number,
): Promise<number[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: {
      id: number;
      comicSeriesId: number;
      comicBookId: number;
      createdAt: string;
      updatedAt: string;
    }[] = await db
      .select()
      .from(comicSeriesBooksTable)
      .where(eq(comicSeriesBooksTable.comicSeriesId, seriesId));

    // Return the comicBookId (the linked comic book) for all association rows
    return result.map((row) => row.comicBookId);
  } catch (error) {
    dbLogger.error("Error fetching comic books in series:" + error);
    throw error;
  }
};

/**
 * Deletes a comic series from the database by ID
 * @param seriesId The ID of the comic series to delete
 * @returns The ID of the deleted series
 */
export const deleteComicSeries = async (
  seriesId: number,
): Promise<number> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .delete(comicSeriesTable)
      .where(eq(comicSeriesTable.id, seriesId))
      .returning({ id: comicSeriesTable.id });

    if (result.length === 0) {
      throw new Error(`Comic series with ID ${seriesId} not found`);
    }

    return result[0].id;
  } catch (error) {
    dbLogger.error("Error deleting comic series:" + error);
    throw error;
  }
};
