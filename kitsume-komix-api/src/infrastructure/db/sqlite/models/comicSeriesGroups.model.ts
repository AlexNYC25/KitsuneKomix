import { asc, desc, eq, ilike } from "drizzle-orm";
import type { SQLiteSelect } from "drizzle-orm/sqlite-core";

import { getClient } from "../client.ts";
import { dbLogger } from "#logger/loggers.ts";
import {
  comicBookSeriesGroupsTable,
  comicSeriesGroupsTable,
  comicBooksTable
} from "#infrastructure/db/sqlite/schemas/index.ts";

import type { 
  ComicSeriesGroup,
  ComicSeriesGroupsFilterItem,
  ComicSeriesGroupsSortField,
  ComicSeriesGroupsFilteringAndSortingParams
} from "#types/index.ts";

import {
  env
} from "#config/env.ts";

/**
 * Exclusive dynamic filtering function for comic series groups.
 * Filters series groups based on allowed filter properties and values.
 * @param filter Filter object with property and value to filter by
 * @param query The current query object to apply the filter to
 * @returns The modified query object with the filter applied
 */
const addFilteringToQuery = <T extends SQLiteSelect>(
  filter: ComicSeriesGroupsFilterItem,
  query: T
): T => {
  const { filterProperty, filterValue } = filter;

  switch (filterProperty) {
    case "id":
      return query.where(eq(comicSeriesGroupsTable.id, Number(filterValue)));
    case "name":
      return query.where(ilike(comicSeriesGroupsTable.name, `%${filterValue}%`));
    case "description":
      return query.where(ilike(comicSeriesGroupsTable.description, `%${filterValue}%`));
    default:
      return query; // If filter property is not recognized, return the original query without modification
  }
}

/**
 * Exclusive dynamic sorting function for comic story arcs.
 * Sorts series groups based on allowed sort properties and directions.
 * @param sortProperty The field to sort by
 * @param sortDirection Sort direction, either "asc" or "desc"
 * @param query The query object to apply the sorting to
 * @returns The modified query object with the sorting applied
 */
const addSortingToQuery = <T extends SQLiteSelect>(
  sortProperty: ComicSeriesGroupsSortField,
  sortDirection: string,
  query: T
): T => {
  const direction = sortDirection === "asc" ? asc : desc;

  switch (sortProperty) {
    case "id":
      return query.orderBy(direction(comicSeriesGroupsTable.id));
    case "name":
      return query.orderBy(direction(comicSeriesGroupsTable.name));
    case "createdAt":
      return query.orderBy(direction(comicSeriesGroupsTable.createdAt));
    case "updatedAt":
      return query.orderBy(direction(comicSeriesGroupsTable.updatedAt));
    default:
      return query; // If sort property is not recognized, return the original query without modification
  }
}

/**
 * Gets comic collections/series groups with optional filtering and sorting.
 * @param serviceDetails Filtering and sorting parameters 
 * @returns 
 */
export const getComicSeriesGroupsFilteringSorting = async (
  serviceDetails: ComicSeriesGroupsFilteringAndSortingParams
): Promise<ComicSeriesGroup[]> => {
  const { db, client } = getClient();
  
  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  const offset = serviceDetails.offset ?? 0;
  const limit = serviceDetails.limit ?? env.PAGE_SIZE;

  try {
    let query = db.select(
      {
        id: comicSeriesGroupsTable.id,
        name: comicSeriesGroupsTable.name,
        description: comicSeriesGroupsTable.description,
        createdAt: comicSeriesGroupsTable.createdAt,
        updatedAt: comicSeriesGroupsTable.updatedAt,
      }
    ).from(comicSeriesGroupsTable)
    .leftJoin(
      comicBookSeriesGroupsTable,
      eq(
        comicSeriesGroupsTable.id,
        comicBookSeriesGroupsTable.comicSeriesGroupId
      )
    )
    .leftJoin(
      comicBooksTable,
      eq(
        comicBookSeriesGroupsTable.comicBookId,
        comicBooksTable.id
      )
    )
    .groupBy(comicSeriesGroupsTable.id)
    .offset(offset)
    .limit(limit)
    .$dynamic();

    if (serviceDetails.sort?.property && serviceDetails.sort?.order) {
      query = addSortingToQuery(
        serviceDetails.sort.property,
        serviceDetails.sort.order,
        query
      );
    }

    if (serviceDetails.filters && serviceDetails.filters.length > 0) {
      for (const filter of serviceDetails.filters) {
        query = addFilteringToQuery(filter, query);
      }
    }

    return await query;
  } catch (error) {
    dbLogger.error("Error fetching comic series groups with filtering and sorting:" + error);
    throw new Error("Failed to fetch comic series groups.");
  }

}

/**
 * Inserts a new comic series group into the database
 * @param name The name of the series group
 * @param description Optional description of the series group
 * @returns The ID of the newly inserted or existing series group
 */
export const insertComicSeriesGroup = async (
  name: string,
  description?: string,
): Promise<number> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { id: number }[] = await db
      .insert(comicSeriesGroupsTable)
      .values({ name, description: description ?? null })
      .onConflictDoNothing()
      .returning({ id: comicSeriesGroupsTable.id });

    // If result is empty, it means the series group already exists due to onConflictDoNothing
    if (result.length === 0) {
      // Find the existing series group by name (which should be unique)
      const existingGroup: { id: number }[] = await db
        .select({ id: comicSeriesGroupsTable.id })
        .from(comicSeriesGroupsTable)
        .where(eq(comicSeriesGroupsTable.name, name));

      if (existingGroup.length > 0) {
        dbLogger.info(
          `Comic series group already exists with name: ${name}, returning existing ID: ${
            existingGroup[0].id
          }`,
        );
        return existingGroup[0].id;
      }

      throw new Error(
        `Failed to insert comic series group and could not find existing group. Name: ${name}`,
      );
    }

    return result[0].id;
  } catch (error) {
    dbLogger.error("Error creating comic series group:" + error);
    throw error;
  }
};

/**
 * Links a series group to a comic book by creating a relationship in the junction table
 * @param seriesGroupId The ID of the series group
 * @param comicBookId The ID of the comic book
 * @returns void
 */
export const linkSeriesGroupToComicBook = async (
  seriesGroupId: number,
  comicBookId: number,
  position: number = 0,
): Promise<void> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    await db
      .insert(comicBookSeriesGroupsTable)
      .values({
        comicSeriesGroupId: seriesGroupId,
        comicBookId: comicBookId,
        position
      })
      .onConflictDoNothing(); // Avoid duplicate links
  } catch (error) {
    dbLogger.error("Error linking comic series group to comic book:" + error);
    throw new Error("Failed to link comic series group to comic book.");
  }
};

/**
 * Unlinks all series groups from a comic book by removing all relationships in the junction table
 * @param comicBookId The ID of the comic book
 * @returns void
 */
export const unlinkSeriesGroupsToComicBook = async (
  comicBookId: number,
): Promise<void> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    await db
      .delete(comicBookSeriesGroupsTable)
      .where(eq(comicBookSeriesGroupsTable.comicBookId, comicBookId));
  } catch (error) {
    dbLogger.error("Error unlinking series groups from comic book:" + error);
    throw error;
  }
};

/**
 * Retrieves all series groups for a specific comic book
 * @param comicBookId The ID of the comic book
 * @returns An array of ComicSeriesGroup objects associated with the comic book
 */
export const getSeriesGroupsByComicBookId = async (
  comicBookId: number,
): Promise<ComicSeriesGroup[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { comicSeriesGroup: ComicSeriesGroup }[] = await db
      .select({
        comicSeriesGroup: comicSeriesGroupsTable,
      })
      .from(comicSeriesGroupsTable)
      .innerJoin(
        comicBookSeriesGroupsTable,
        eq(
          comicSeriesGroupsTable.id,
          comicBookSeriesGroupsTable.comicSeriesGroupId,
        ),
      )
      .where(eq(comicBookSeriesGroupsTable.comicBookId, comicBookId));

    return result.map((row) => row.comicSeriesGroup);
  } catch (error) {
    dbLogger.error(`Error fetching series groups for comic book ID ${comicBookId}:` + error);
    throw new Error("Failed to fetch series groups for comic book.");
  }
};
