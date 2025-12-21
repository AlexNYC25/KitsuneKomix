import { eq, and, asc, desc } from "drizzle-orm";
import { SQLiteColumn } from "drizzle-orm/sqlite-core";

import { getClient } from "../client.ts";
import { comicBookStoryArcsTable, comicStoryArcsTable } from "../schema.ts";

import type { ComicStoryArc} from "#types/index.ts";
import type { ComicStoryArcQueryParams } from "#interfaces/index.ts";

import { PAGE_SIZE_DEFAULT } from "#utilities/constants.ts";

/**
 * Retrieves all comic story arcs with optional filtering and sorting
 * @param params Query parameters including offset, limit, filters, sort column and order
 * @returns An array of ComicStoryArc objects matching the query parameters
 */
export const getAllComicStoryArcs = async (
  params: ComicStoryArcQueryParams = {}
): Promise<ComicStoryArc[]> => {
  const { db, client } = getClient();

  const {
    offset = 0,
    limit = PAGE_SIZE_DEFAULT,
    nameFilter,
    descriptionFilter,
    sortBy,
    sortOrder
  } = params;

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {

const whereConditions: Array<ReturnType<typeof eq>> = [];


    if (nameFilter) {
      whereConditions.push(eq(comicStoryArcsTable.name, nameFilter));
    }

    if (descriptionFilter) {
      whereConditions.push(eq(comicStoryArcsTable.description, descriptionFilter));
    }

    let orderByColumn: SQLiteColumn;

    switch (sortBy) {
      case "name":
        orderByColumn = comicStoryArcsTable.name;
        break;
      case "created_at":
        orderByColumn = comicStoryArcsTable.createdAt;
        break;
      case "updated_at":
        orderByColumn = comicStoryArcsTable.updatedAt;
        break;
      default:
        orderByColumn = comicStoryArcsTable.id;
        break;
    }

    const baseQuery = db.select().from(comicStoryArcsTable).$dynamic();

    // Apply where conditions
    const finalQuery: typeof baseQuery = whereConditions.length > 0
          ? baseQuery.where(and(...whereConditions))
          : baseQuery;


    const result: ComicStoryArc[] = await finalQuery
          .orderBy(sortOrder === "asc" ? asc(orderByColumn) : desc(orderByColumn))
          .limit(limit)
          .offset(offset);

    return result;
  } catch (error) {
    console.error("Error fetching all comic story arcs:", error);
    throw new Error("Failed to fetch all comic story arcs.");
  }
};

/**
 * Retrieves a specific comic story arc by ID
 * @param storyArcId The ID of the story arc
 * @returns The ComicStoryArc object, or null if not found
 */
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
export const insertComicStoryArc = async (name: string, description?: string ): Promise<number> => {
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

