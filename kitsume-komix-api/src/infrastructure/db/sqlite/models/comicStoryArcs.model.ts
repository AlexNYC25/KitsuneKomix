import { and, asc, desc, eq, ilike } from "drizzle-orm";
import { SQLiteColumn, SQLiteSelect } from "drizzle-orm/sqlite-core";

import { getClient } from "../client.ts";
import {
  comicBooksTable,
  comicBookStoryArcsTable,
  comicStoryArcsTable,
} from "../schema.ts";

import type {
  ComicBookFilteringAndSortingParams,
  ComicStoryArc,
  ComicStoryArcFilterItem,
  ComicStoryArcsFilteringAndSortingParams,
} from "#types/index.ts";
import type { ComicStoryArcQueryParams } from "#interfaces/index.ts";
import type {
  ComicReadlistsFilterField,
  ComicReadlistsSortField,
} from "#types/parameters.type.ts";

import { PAGE_SIZE_DEFAULT } from "#utilities/constants.ts";

/**
 * Exclusive dynamic filtering function for comic story arcs.
 * Filters story arcs by name, description, or timestamp fields.
 * @param filter - Filter configuration with property and value
 * @param query - The query builder to apply filters to
 * @returns The query with filters applied
 */
const addFilteringToQuery = <T extends SQLiteSelect>(
  filter: ComicStoryArcFilterItem,
  query: T,
): T => {
  const { filterProperty, filterValue } = filter;

  switch (filterProperty) {
    case "id":
      query.where(eq(comicStoryArcsTable.id, Number(filterValue)));
      break;
    case "name":
      query.where(ilike(comicStoryArcsTable.name, `%${filterValue}%`));
      break;
    case "description":
      query.where(ilike(comicStoryArcsTable.description, `%${filterValue}%`));
      break;
  }

  return query;
};

/**
 * Exclusive dynamic sorting function for comic story arcs.
 * Sorts story arcs by name, creation date, or update date.
 * @param sortProperty - The field to sort by
 * @param sortDirection - Sort direction ("asc" or "desc")
 * @param query - The query builder to apply sorting to
 * @returns The query with sorting applied
 */
const addSortingToQuery = <T extends SQLiteSelect>(
  sortProperty: ComicReadlistsSortField,
  sortDirection: string,
  query: T,
): T => {
  const direction = sortDirection === "asc" ? asc : desc;

  switch (sortProperty) {
    case "id":
      query.orderBy(direction(comicStoryArcsTable.id));
      break;
    case "name":
      query.orderBy(direction(comicStoryArcsTable.name));
      break;
    case "createdAt":
      query.orderBy(direction(comicStoryArcsTable.createdAt));
      break;
    case "updatedAt":
      query.orderBy(direction(comicStoryArcsTable.updatedAt));
      break;
  }

  return query;
};

export const getComicStoryArcsFilteringSorting = async (
  serviceDetails: ComicStoryArcsFilteringAndSortingParams,
): Promise<ComicStoryArc[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database client is not initialized");
  }

  const offset = serviceDetails.offset || 0;
  const limit = serviceDetails.limit || PAGE_SIZE_DEFAULT;

  try {
    let query = db.select(
      {
        id: comicStoryArcsTable.id,
        name: comicStoryArcsTable.name,
        description: comicStoryArcsTable.description,
        createdAt: comicStoryArcsTable.createdAt,
        updatedAt: comicStoryArcsTable.updatedAt,
      },
    ).from(comicStoryArcsTable)
      .leftJoin(
        comicBookStoryArcsTable,
        eq(comicStoryArcsTable.id, comicBookStoryArcsTable.comicStoryArcId),
      )
      .leftJoin(
        comicBooksTable,
        eq(comicBookStoryArcsTable.comicBookId, comicBooksTable.id),
      )
      .groupBy(comicStoryArcsTable.id)
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
      query = addFilteringToQuery(serviceDetails.filters[0], query);
    }

    return query;
  } catch (error) {
    console.error(
      "Error fetching comic books with metadata filtering and sorting:",
      error,
    );
    throw new Error(
      "Failed to fetch comic books with metadata filtering and sorting.",
    );
  }
};

/**
 * Retrieves a specific comic story arc by ID
 * @param storyArcId The ID of the story arc
 * @returns The ComicStoryArc object, or null if not found
 */
/**
 * Unlinks all story arcs from a comic book by removing all relationships in the junction table
 * @param comicBookId The ID of the comic book
 * @returns void
 */
export const unlinkStoryArcsToComicBook = async (
  comicBookId: number,
): Promise<void> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    await db
      .delete(comicBookStoryArcsTable)
      .where(eq(comicBookStoryArcsTable.comicBookId, comicBookId));
  } catch (error) {
    console.error("Error unlinking story arcs from comic book:", error);
    throw error;
  }
};

export const getComicStoryArcById = async (
  storyArcId: number,
): Promise<ComicStoryArc | null> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: ComicStoryArc[] = await db
      .select()
      .from(comicStoryArcsTable)
      .where(eq(comicStoryArcsTable.id, storyArcId));

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error(
      `Error fetching comic story arc by ID ${storyArcId}:`,
      error,
    );
    throw new Error("Failed to fetch comic story arc by ID.");
  }
};

/**
 * Retrieves all comic book IDs that are part of a specific story arc
 * @param storyArcId The ID of the story arc
 * @returns An array of comic book IDs in the story arc
 */
export const getComicsInStoryArc = async (
  storyArcId: number,
): Promise<number[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { comicBookId: number }[] = await db
      .select({ comicBookId: comicBookStoryArcsTable.comicBookId })
      .from(comicBookStoryArcsTable)
      .where(eq(comicBookStoryArcsTable.comicStoryArcId, storyArcId));

    return result.map((row) => row.comicBookId);
  } catch (error) {
    console.error(
      `Error fetching comics in story arc ID ${storyArcId}:`,
      error,
    );
    throw new Error("Failed to fetch comics in story arc.");
  }
};

/**
 * Retrieves a specific comic story arc by name
 * @param name The name of the story arc
 * @returns The ComicStoryArc object, or null if not found
 */
export const getComicStoryArcByName = async (
  name: string,
): Promise<ComicStoryArc | null> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: ComicStoryArc[] = await db
      .select()
      .from(comicStoryArcsTable)
      .where(eq(comicStoryArcsTable.name, name));

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error(
      `Error fetching comic story arc by name ${name}:`,
      error,
    );
    throw new Error("Failed to fetch comic story arc by name.");
  }
};

/**
 * Inserts a new comic story arc into the database
 * @param name The name of the story arc
 * @param description Optional description of the story arc
 * @returns The ID of the newly inserted or existing story arc
 */
export const insertComicStoryArc = async (
  name: string,
  description?: string,
): Promise<number> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { id: number }[] = await db
      .insert(comicStoryArcsTable)
      .values({ name, description })
      .onConflictDoNothing()
      .returning({ id: comicStoryArcsTable.id });

    // If result is empty, it means the story arc already exists due to onConflictDoNothing
    if (result.length === 0) {
      // Find the existing story arc by name (which should be unique)
      const existingStoryArc: { id: number }[] = await db
        .select({ id: comicStoryArcsTable.id })
        .from(comicStoryArcsTable)
        .where(eq(comicStoryArcsTable.name, name));

      if (existingStoryArc.length > 0) {
        console.log(
          `Comic story arc already exists with name: ${name}, returning existing ID: ${
            existingStoryArc[0].id
          }`,
        );
        return existingStoryArc[0].id;
      }

      throw new Error(
        `Failed to insert comic story arc and could not find existing story arc. Name: ${name}`,
      );
    }

    return result[0].id;
  } catch (error) {
    console.error("Error inserting comic story arc:", error);
    throw new Error("Failed to insert comic story arc.");
  }
};

/**
 * Deletes a comic story arc by ID
 * @param storyArcId The ID of the story arc to delete
 * @returns void
 */
export const deleteComicStoryArcById = async (
  storyArcId: number,
): Promise<void> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    await db
      .delete(comicStoryArcsTable)
      .where(eq(comicStoryArcsTable.id, storyArcId));
  } catch (error) {
    console.error("Error deleting comic story arc by ID:", error);
    throw new Error("Failed to delete comic story arc by ID.");
  }
};

/**
 * Links a story arc to a comic book by creating a relationship in the junction table
 * @param storyArcId The ID of the story arc
 * @param comicBookId The ID of the comic book
 * @returns void
 */
export const linkStoryArcToComicBook = async (
  storyArcId: number,
  comicBookId: number,
): Promise<void> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    await db
      .insert(comicBookStoryArcsTable)
      .values({ comicStoryArcId: storyArcId, comicBookId: comicBookId })
      .onConflictDoNothing(); // Avoid duplicate links
  } catch (error) {
    console.error("Error linking comic story arc to comic book:", error);
    throw new Error("Failed to link comic story arc to comic book.");
  }
};

/**
 * Retrieves all story arcs for a specific comic book
 * @param comicBookId The ID of the comic book
 * @returns An array of ComicStoryArc objects associated with the comic book
 */
export const getStoryArcsByComicBookId = async (
  comicBookId: number,
): Promise<ComicStoryArc[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { comicStoryArc: ComicStoryArc }[] = await db
      .select({
        comicStoryArc: comicStoryArcsTable,
      })
      .from(comicStoryArcsTable)
      .innerJoin(
        comicBookStoryArcsTable,
        eq(comicStoryArcsTable.id, comicBookStoryArcsTable.comicStoryArcId),
      )
      .where(eq(comicBookStoryArcsTable.comicBookId, comicBookId));

    return result.map((row) => row.comicStoryArc);
  } catch (error) {
    console.error(
      `Error fetching story arcs for comic book ID ${comicBookId}:`,
      error,
    );
    throw new Error("Failed to fetch story arcs for comic book.");
  }
};
