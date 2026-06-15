import { eq, ilike } from "drizzle-orm";

import { getClient } from "../client.ts";
import { dbLogger } from "#logger/loggers.ts";
import { comicBookPencilersTable, comicPencilersTable } from "#infrastructure/db/sqlite/schemas/index.ts";

import type { ComicPenciler } from "#types/index.ts";

/**
 * Inserts a new comic penciler into the database
 * @param name The name of the penciler
 * @param description Optional description of the penciler
 * @returns The ID of the newly inserted or existing penciler
 * @throws Error if there is an issue with the database operation
 */
export const insertComicPenciler = async (
  name: string,
  description?: string,
): Promise<number> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { id: number }[] = await db
      .insert(comicPencilersTable)
      .values({ name, description: description ?? null })
      .onConflictDoNothing()
      .returning({ id: comicPencilersTable.id });

    // If result is empty, it means the penciler already exists due to onConflictDoNothing
    if (result.length === 0) {
      // Find the existing penciler by name (which should be unique)
      const existingPenciler: { id: number }[] = await db
        .select({ id: comicPencilersTable.id })
        .from(comicPencilersTable)
        .where(eq(comicPencilersTable.name, name));

      if (existingPenciler.length > 0) {
        dbLogger.info(
          `Comic penciler already exists with name: ${name}, returning existing ID: ${
            existingPenciler[0].id
          }`,
        );
        return existingPenciler[0].id;
      }

      throw new Error(
        `Failed to insert comic penciler and could not find existing penciler. Name: ${name}`,
      );
    }

    return result[0].id;
  } catch (error) {
    dbLogger.error("Error inserting comic penciler:" + error);
    throw error;
  }
};

/**
 * Links a penciler to a comic book by creating a relationship in the junction table
 * @param pencilerId The ID of the penciler
 * @param comicBookId The ID of the comic book
 * @returns void
 */
export const linkPencilerToComicBook = async (
  pencilerId: number,
  comicBookId: number,
): Promise<void> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    await db
      .insert(comicBookPencilersTable)
      .values({ comicPencilerId: pencilerId, comicBookId: comicBookId })
      .onConflictDoNothing(); // Avoid duplicate links
  } catch (error) {
    dbLogger.error("Error linking penciler to comic book:" + error);
    throw error;
  }
};

/**
 * Unlinks all pencilers from a comic book by removing all relationships in the junction table
 * @param comicBookId The ID of the comic book
 * @returns void
 */
export const unlinkPencilersToComicBook = async (
  comicBookId: number,
): Promise<void> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    await db
      .delete(comicBookPencilersTable)
      .where(eq(comicBookPencilersTable.comicBookId, comicBookId));
  } catch (error) {
    dbLogger.error("Error unlinking pencilers from comic book:" + error);
    throw error;
  }
};

/**
 * Retrieves all pencilers for a specific comic book
 * @param comicBookId The ID of the comic book
 * @returns An array of ComicPenciler objects associated with the comic book
 */
export const getPencilersByComicBookId = async (
  comicBookId: number,
): Promise<ComicPenciler[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { comic_penciler: ComicPenciler }[] = await db
      .select({
        comic_penciler: comicPencilersTable,
      })
      .from(comicPencilersTable)
      .innerJoin(
        comicBookPencilersTable,
        eq(
          comicPencilersTable.id,
          comicBookPencilersTable.comicPencilerId,
        ),
      )
      .where(eq(comicBookPencilersTable.comicBookId, comicBookId));

    return result.map(({ comic_penciler }) => comic_penciler);
  } catch (error) {
    dbLogger.error("Error fetching pencilers by comic book ID:" + error);
    throw error;
  }
};

/**
 * Searches for penciler IDs by name filter
 * @param filter The partial name to search for (case-insensitive)
 * @returns An array of penciler IDs matching the filter
 */
export const getPencilerIdsByFilter = async (
  filter: string,
): Promise<number[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { id: number }[] = await db
      .select({ id: comicPencilersTable.id })
      .from(comicPencilersTable)
      .where(ilike(comicPencilersTable.name, `%${filter}%`));

    return result.map((row) => row.id);
  } catch (error) {
    dbLogger.error("Error fetching penciler IDs by filter:" + error);
    throw error;
  }
};
