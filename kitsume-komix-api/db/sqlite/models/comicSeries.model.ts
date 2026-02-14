import { desc, eq, inArray, sql, asc, ilike } from "drizzle-orm";
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
  comicLibrariesSeriesTable,
  comicLibrariesTable,
  comicLocationsTable,
  comicPencillersTable,
  comicPublishersTable,
  comicSeriesBooksTable,
  comicSeriesGroupsTable,
  comicSeriesTable,
  comicStoryArcsTable,
  comicTeamsTable,
  comicWritersTable,
} from "../schema.ts";

import type {
  ComicSeries,
  ComicSeriesWithMetadata,
  NewComicSeries,
  ComicSeriesFilteringAndSortingParams,
  ComicSeriesFilterItem,
  ComicSeriesSortField,
} from "#types/index.ts";
import { PAGE_SIZE_DEFAULT } from "../../../constants/index.ts";

/**
 * Exclusive dynamic filtering function specifcally for getComicSeriesWithMetadataFilteringSorting
 * This is necessary as the filtering can be applied to any of the fields in the comic series table and we need to dynamically apply it to the query builder.
 * @param filter 
 * @param query 
 * @returns the query with the filter applied
 */
const addFilteringToQuery = <T extends SQLiteSelect>(filter: ComicSeriesFilterItem, query: T): T => {
  const { filterProperty, filterValue } = filter;

  switch (filterProperty) {
    case "id":
      query.where(eq(comicSeriesTable.id, Number(filterValue)));
      break;
    case "name":
      query.where(ilike(comicSeriesTable.name, `%${filterValue}%`));
      break;
    case "description":
      query.where(ilike(comicSeriesTable.description, `%${filterValue}%`));
      break;
  }

  return query;
};

/**
 * Exclusive dynamic sorting function specifcally for getComicSeriesWithMetadataFilteringSorting
 * This is necessary as the sorting can be applied to any of the fields in the comic series table and we need to dynamically apply it to the query builder.
 * @param sortProperty 
 * @param sortDirection 
 * @param query 
 * @returns the query with the sorting applied
 */
const addSortingToQuery = <T extends SQLiteSelect>(sortProperty: ComicSeriesSortField, sortDirection: string, query: T): T => {
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
  const limit = serviceDetails.limit || PAGE_SIZE_DEFAULT;

  try {
    let query = 
      db.select(
        {
          id: comicSeriesTable.id,
          name: comicSeriesTable.name,
          description: comicSeriesTable.description,
          folderPath: comicSeriesTable.folderPath,
          createdAt: comicSeriesTable.createdAt,
          updatedAt: comicSeriesTable.updatedAt,
        }
      ).from(comicSeriesTable)
      .groupBy(comicSeriesTable.id)
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
    console.error("Error fetching comic series with metadata filtering and sorting:", error);
    throw error;
  }
}


////// TODO: REMOVE THIS COMMENT/ Placeholder for verified code

/**
 * Inserts a new comic series into the database
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
          console.log(
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
    console.error("Error inserting comic series:", error);
    throw error;
  }
};

/**
 * Adds a comic series to a library by creating a relationship
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
    console.error("Error inserting comic series into library:", error);
    throw error;
  }
};

/**
 * Retrieves a comic series by ID
 * @param id The ID of the series
 * @returns The ComicSeries object, or null if not found
 */
export const getComicSeriesById = async (
  id: number,
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
        eq(comicSeriesTable.id, id),
      );

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Error fetching comic series by ID:", error);
    throw error;
  }
};

/**
 * Get the metadata for a comic series by its ID by compiling it from the comic books under it
 * @param id The ID of the comic series to retrieve metadata for.
 * @returns The metadata of the comic series or null if not found.
 */
export const getComicSeriesMetadataById = async (
  id: number,
): Promise<ComicSeriesWithMetadata | null> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .select({
        id: comicSeriesTable.id,
        name: comicSeriesTable.name,
        description: comicSeriesTable.description,
        folderPath: comicSeriesTable.folderPath,
        createdAt: comicSeriesTable.createdAt,
        updatedAt: comicSeriesTable.updatedAt,
        writers: sql<string>`GROUP_CONCAT(DISTINCT ${comicWritersTable}.name)`,
        pencillers: sql<
          string
        >`GROUP_CONCAT(DISTINCT ${comicPencillersTable}.name)`,
        inkers: sql<string>`GROUP_CONCAT(DISTINCT ${comicInkersTable}.name)`,
        colorists: sql<
          string
        >`GROUP_CONCAT(DISTINCT ${comicColoristsTable}.name)`,
        letterers: sql<
          string
        >`GROUP_CONCAT(DISTINCT ${comicLetterersTable}.name)`,
        editors: sql<string>`GROUP_CONCAT(DISTINCT ${comicEditorsTable}.name)`,
        coverArtists: sql<
          string
        >`GROUP_CONCAT(DISTINCT ${comicCoverArtistsTable}.name)`,
        publishers: sql<
          string
        >`GROUP_CONCAT(DISTINCT ${comicPublishersTable}.name)`,
        imprints: sql<
          string
        >`GROUP_CONCAT(DISTINCT ${comicImprintsTable}.name)`,
        genres: sql<string>`GROUP_CONCAT(DISTINCT ${comicGenresTable}.name)`,
        characters: sql<
          string
        >`GROUP_CONCAT(DISTINCT ${comicCharactersTable}.name)`,
        teams: sql<string>`GROUP_CONCAT(DISTINCT ${comicTeamsTable}.name)`,
        locations: sql<
          string
        >`GROUP_CONCAT(DISTINCT ${comicLocationsTable}.name)`,
        storyArcs: sql<
          string
        >`GROUP_CONCAT(DISTINCT ${comicStoryArcsTable}.name)`,
        seriesGroups: sql<
          string
        >`GROUP_CONCAT(DISTINCT ${comicSeriesGroupsTable}.name)`,
      })
      .from(comicSeriesTable)
      .leftJoin(
        comicSeriesBooksTable,
        eq(comicSeriesTable.id, comicSeriesBooksTable.comicSeriesId),
      )
      .leftJoin(
        comicBooksTable,
        eq(comicSeriesBooksTable.comicBookId, comicBooksTable.id),
      )
      .leftJoin(
        comicBookWritersTable,
        eq(comicBooksTable.id, comicBookWritersTable.comicBookId),
      )
      .leftJoin(
        comicWritersTable,
        eq(comicBookWritersTable.comicWriterId, comicWritersTable.id),
      )
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
      .leftJoin(
        comicBookInkersTable,
        eq(comicBooksTable.id, comicBookInkersTable.comicBookId),
      )
      .leftJoin(
        comicInkersTable,
        eq(comicBookInkersTable.comicInkerId, comicInkersTable.id),
      )
      .leftJoin(
        comicBookColoristsTable,
        eq(comicBooksTable.id, comicBookColoristsTable.comicBookId),
      )
      .leftJoin(
        comicColoristsTable,
        eq(comicBookColoristsTable.comicColoristId, comicColoristsTable.id),
      )
      .leftJoin(
        comicBookLetterersTable,
        eq(comicBooksTable.id, comicBookLetterersTable.comicBookId),
      )
      .leftJoin(
        comicLetterersTable,
        eq(comicBookLetterersTable.comicLetterId, comicLetterersTable.id),
      )
      .leftJoin(
        comicBookEditorsTable,
        eq(comicBooksTable.id, comicBookEditorsTable.comicBookId),
      )
      .leftJoin(
        comicEditorsTable,
        eq(comicBookEditorsTable.comicEditorId, comicEditorsTable.id),
      )
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
      .leftJoin(
        comicBookImprintsTable,
        eq(comicBooksTable.id, comicBookImprintsTable.comicBookId),
      )
      .leftJoin(
        comicImprintsTable,
        eq(comicBookImprintsTable.comicImprintId, comicImprintsTable.id),
      )
      .leftJoin(
        comicBookGenresTable,
        eq(comicBooksTable.id, comicBookGenresTable.comicBookId),
      )
      .leftJoin(
        comicGenresTable,
        eq(comicBookGenresTable.comicGenreId, comicGenresTable.id),
      )
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
      .leftJoin(
        comicBookTeamsTable,
        eq(comicBooksTable.id, comicBookTeamsTable.comicBookId),
      )
      .leftJoin(
        comicTeamsTable,
        eq(comicBookTeamsTable.comicTeamId, comicTeamsTable.id),
      )
      .leftJoin(
        comicBookLocationsTable,
        eq(comicBooksTable.id, comicBookLocationsTable.comicBookId),
      )
      .leftJoin(
        comicLocationsTable,
        eq(comicBookLocationsTable.comicLocationId, comicLocationsTable.id),
      )
      .leftJoin(
        comicBookStoryArcsTable,
        eq(comicBooksTable.id, comicBookStoryArcsTable.comicBookId),
      )
      .leftJoin(
        comicStoryArcsTable,
        eq(comicBookStoryArcsTable.comicStoryArcId, comicStoryArcsTable.id),
      )
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
      .where(eq(comicSeriesTable.id, id))
      .groupBy(comicSeriesTable.id);

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Error fetching comic series metadata by ID:", error);
    throw error;
  }
};

/**
 * Retrieves a comic series by name
 * @param name The name of the series
 * @returns The ComicSeries object, or null if not found
 */
export const getComicSeriesByName = async (
  name: string,
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
        eq(comicSeriesTable.name, name),
      );

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Error fetching comic series by name:", error);
    throw error;
  }
};

/**
 * Retrieves a comic series by folder path
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
    console.error("Error fetching comic series by path:", error);
    throw error;
  }
};

/**
 * Retrieves all comic series from the database
 * @returns An array of all ComicSeries objects
 */
export const getAllComicSeries = async (): Promise<ComicSeries[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: ComicSeries[] = await db.select().from(comicSeriesTable);
    return result;
  } catch (error) {
    console.error("Error fetching all comic series:", error);
    throw error;
  }
};

/**
 * Retrieves the most recently created comic series
 * @param limit The maximum number of series to retrieve
 * @returns An array of the latest ComicSeries objects
 */
export const getLatestComicSeries = async (
  limit: number,
  offset: number = 0,
  libraryIds?: number[],
): Promise<ComicSeries[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { comicSeries: ComicSeries }[] = await db
      .select({
        comicSeries: comicSeriesTable,
      })
      .from(comicSeriesTable)
      .leftJoin(
        comicLibrariesSeriesTable,
        eq(comicSeriesTable.id, comicLibrariesSeriesTable.comicSeriesId),
      )
      .leftJoin(
        comicLibrariesTable,
        eq(comicLibrariesSeriesTable.libraryId, comicLibrariesTable.id),
      )
      .where(
        libraryIds && libraryIds.length > 0
          ? inArray(comicLibrariesTable.id, libraryIds)
          : undefined,
      )
      .groupBy(comicSeriesTable.id)
      .orderBy(desc(comicSeriesTable.createdAt))
      .limit(limit)
      .offset(offset);

    const comicSeriesResults: ComicSeries[] = result.map((row) => row.comicSeries);

    return comicSeriesResults;
  } catch (error) {
    console.error("Error fetching latest comic series:", error);
    throw error;
  }
};

/**
 * Retrieves comic series that have been updated since a specific date
 * @param since The date to filter series by (ISO string)
 * @param limit The maximum number of series to retrieve
 * @returns An array of ComicSeries objects updated after the specified date
 */
export const getUpdatedComicSeries = async (
  limit: number,
  offset: number = 0,
  libraryIds?: number[],
): Promise<ComicSeries[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .select({
        comicSeries: comicSeriesTable,
      })
      .from(comicSeriesTable)
      .leftJoin(
        comicLibrariesSeriesTable,
        eq(comicSeriesTable.id, comicLibrariesSeriesTable.comicSeriesId),
      )
      .leftJoin(
        comicLibrariesTable,
        eq(comicLibrariesSeriesTable.libraryId, comicLibrariesTable.id),
      )
      .leftJoin(
        comicSeriesBooksTable,
        eq(comicSeriesTable.id, comicSeriesBooksTable.comicSeriesId),
      )
      .leftJoin(
        comicBooksTable,
        eq(comicSeriesBooksTable.comicBookId, comicBooksTable.id),
      )
      .where(
        libraryIds && libraryIds.length > 0
          ? inArray(comicLibrariesTable.id, libraryIds)
          : undefined,
      )
      .groupBy(comicSeriesTable.id)
      .orderBy(desc(comicBooksTable.updatedAt))
      .limit(limit)
      .offset(offset);

    const comicSeriesResults: ComicSeries[] = result.map((row) => row.comicSeries);

    return comicSeriesResults;
  } catch (error) {
    console.error("Error fetching updated comic series:", error);
    throw error;
  }
};

/**
 * Updates an existing comic series with new data
 * @param id The ID of the series to update
 * @param updates Partial data to update in the series
 * @returns A boolean indicating if the update was successful
 */
export const updateComicSeries = async (
  id: number,
  updates: Partial<NewComicSeries>,
): Promise<boolean> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const updateData: Record<string, unknown> = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) {
      updateData.description = updates.description;
    }
    if (updates.folderPath !== undefined) {
      updateData.folderPath = updates.folderPath;
    }

    if (Object.keys(updateData).length === 0) {
      return false;
    }

    const result: { id: number }[] = await db
      .update(comicSeriesTable)
      .set(updateData)
      .where(eq(comicSeriesTable.id, id))
      .returning({ id: comicSeriesTable.id });

    return result.length > 0;
  } catch (error) {
    console.error("Error updating comic series:", error);
    throw error;
  }
};

/**
 * Deletes a comic series by ID
 * @param id The ID of the series to delete
 * @returns A boolean indicating if the deletion was successful
 */
export const deleteComicSeries = async (id: number): Promise<boolean> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { id: number }[] = await db
      .delete(comicSeriesTable)
      .where(eq(comicSeriesTable.id, id))
      .returning({ id: comicSeriesTable.id });

    return result.length > 0;
  } catch (error) {
    console.error("Error deleting comic series:", error);
    throw error;
  }
};

/**
 * Adds a comic book to a series by creating a relationship
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
    console.error("Error adding comic book to series:", error);
    throw error;
  }
};

/**
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
    console.error("Error fetching comic books in series:", error);
    throw error;
  }
};

/**
 * Retrieves the series ID for a specific comic book
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
    console.error("Error fetching series ID from comic book ID:", error);
    throw error;
  }
};
