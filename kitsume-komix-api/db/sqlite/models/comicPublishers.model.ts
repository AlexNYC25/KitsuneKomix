import { eq, ilike } from "drizzle-orm";

import { getClient } from "../client.ts";
import { comicBookPublishersTable, comicPublishersTable } from "../schema.ts";

import type { ComicPublisher } from "#types/index.ts";

/**
 * Inserts a new comic publisher into the database
 * @param name The name of the publisher
 * @returns The ID of the newly inserted or existing publisher
 */
export const insertComicPublisher = async (name: string): Promise<number> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { id: number }[] = await db
      .insert(comicPublishersTable)
      .values({ name })
      .onConflictDoNothing()
      .returning({ id: comicPublishersTable.id });

    // If result is empty, it means the publisher already exists due to onConflictDoNothing
    if (result.length === 0) {
      // Find the existing publisher by name (which should be unique)
      const existingPublisher: { id: number }[] = await db
        .select({ id: comicPublishersTable.id })
        .from(comicPublishersTable)
        .where(eq(comicPublishersTable.name, name));

      if (existingPublisher.length > 0) {
        console.log(
          `Comic publisher already exists with name: ${name}, returning existing ID: ${
            existingPublisher[0].id
          }`,
        );
        return existingPublisher[0].id;
      }

      throw new Error(
        `Failed to insert comic publisher and could not find existing publisher. Name: ${name}`,
      );
    }

    return result[0].id;
  } catch (error) {
    console.error("Error inserting comic publisher:", error);
    throw new Error("Failed to insert comic publisher.");
  }
};

/**
 * Links a publisher to a comic book by creating a relationship in the junction table
 * @param publisherId The ID of the publisher
 * @param comicBookId The ID of the comic book
 * @returns void
 */
export const linkPublisherToComicBook = async (
  publisherId: number,
  comicBookId: number,
): Promise<void> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    await db
      .insert(comicBookPublishersTable)
      .values({ comicPublisherId: publisherId, comicBookId: comicBookId })
      .onConflictDoNothing(); // Avoid duplicate links
  } catch (error) {
    console.error("Error linking publisher to comic book:", error);
    throw error;
  }
};

/**
 * Unlinks all publishers from a comic book by removing all relationships in the junction table
 * @param comicBookId The ID of the comic book
 * @returns void
 */
export const unlinkPublishersToComicBook = async (
  comicBookId: number,
): Promise<void> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    await db
      .delete(comicBookPublishersTable)
      .where(eq(comicBookPublishersTable.comicBookId, comicBookId));
  } catch (error) {
    console.error("Error unlinking publishers from comic book:", error);
    throw error;
  }
};

/**
 * Retrieves all publishers for a specific comic book
 * @param comicBookId The ID of the comic book
 * @returns An array of ComicPublisher objects associated with the comic book
 */
export const getPublishersByComicBookId = async (
  comicBookId: number,
): Promise<ComicPublisher[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { comic_publisher: ComicPublisher }[] = await db
      .select({
        comic_publisher: comicPublishersTable,
      })
      .from(comicPublishersTable)
      .innerJoin(
        comicBookPublishersTable,
        eq(
          comicPublishersTable.id,
          comicBookPublishersTable.comicPublisherId,
        ),
      )
      .where(eq(comicBookPublishersTable.comicBookId, comicBookId));

    return result.map((row) => row.comic_publisher);
  } catch (error) {
    console.error("Error fetching publishers for comic book:", error);
    throw error;
  }
};

/**
 * Searches for publisher IDs by name filter
 * @param filter The partial name to search for (case-insensitive)
 * @returns An array of publisher IDs matching the filter
 */
export const getPublisherIdsByFilter = async (
  filter: string,
): Promise<number[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { id: number }[] = await db
      .select({ id: comicPublishersTable.id })
      .from(comicPublishersTable)
      .where(ilike(comicPublishersTable.name, `%${filter}%`));

    return result.map((row) => row.id);
  } catch (error) {
    console.error("Error fetching publisher IDs by filter:", error);
    throw error;
  }
};
