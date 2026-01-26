import { eq, ilike } from "drizzle-orm";

import { getClient } from "../client.ts";
import { comicBookLetterersTable, comicLetterersTable } from "../schema.ts";

import type { ComicLetterer } from "#types/index.ts";

/**
 * Inserts a new comic letterer into the database or returns the ID of an existing letterer with the same name
 * @param name The name of the letterer to insert
 * @returns The ID of the newly inserted letterer or the ID of the existing letterer with the same name
 */
export const insertComicLetterer = async (name: string): Promise<number> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { id: number }[] = await db
      .insert(comicLetterersTable)
      .values({ name })
      .onConflictDoNothing()
      .returning({ id: comicLetterersTable.id });

    // If result is empty, it means the letterer already exists due to onConflictDoNothing
    if (result.length === 0) {
      // Find the existing letterer by name (which should be unique)
      const existingLetterer: { id: number }[] = await db
        .select({ id: comicLetterersTable.id })
        .from(comicLetterersTable)
        .where(eq(comicLetterersTable.name, name));

      if (existingLetterer.length > 0) {
        console.log(
          `Comic letterer already exists with name: ${name}, returning existing ID: ${
            existingLetterer[0].id
          }`,
        );
        return existingLetterer[0].id;
      }

      throw new Error(
        `Failed to insert comic letterer and could not find existing letterer. Name: ${name}`,
      );
    }

    return result[0].id;
  } catch (error) {
    console.error("Error inserting comic letterer:", error);
    throw error;
  }
};

/**
 * Creates a link between a letterer and a comic book in the database
 * @param lettererId The ID of the letterer to link
 * @param comicBookId The ID of the comic book to link
 * @returns A promise that resolves when the link has been created
 */
export const linkLettererToComicBook = async (
  lettererId: number,
  comicBookId: number,
): Promise<void> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    await db
      .insert(comicBookLetterersTable)
      .values({ comicLetterId: lettererId, comicBookId: comicBookId })
      .onConflictDoNothing(); // Avoid duplicate links
  } catch (error) {
    console.error("Error linking letterer to comic book:", error);
    throw error;
  }
};

/**
 * Unlinks all letterers from a comic book by removing all relationships in the junction table
 * @param comicBookId The ID of the comic book
 * @returns void
 */
export const unlinkLetterersToComicBook = async (
  comicBookId: number,
): Promise<void> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    await db
      .delete(comicBookLetterersTable)
      .where(eq(comicBookLetterersTable.comicBookId, comicBookId));
  } catch (error) {
    console.error("Error unlinking letterers from comic book:", error);
    throw error;
  }
};

/**
 * Retrieves all letterers associated with a specific comic book
 * @param comicBookId The ID of the comic book
 * @returns An array of ComicLetterer objects associated with the comic book
 */
export const getLetterersByComicBookId = async (
  comicBookId: number,
): Promise<ComicLetterer[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { comicLetterer: ComicLetterer }[] = await db
      .select({
        comicLetterer: comicLetterersTable,
      })
      .from(comicLetterersTable)
      .innerJoin(
        comicBookLetterersTable,
        eq(comicLetterersTable.id, comicBookLetterersTable.comicLetterId),
      )
      .where(eq(comicBookLetterersTable.comicBookId, comicBookId));

    return result.map((row) => row.comicLetterer);
  } catch (error) {
    console.error("Error fetching letterers by comic book ID:", error);
    throw error;
  }
};

/**
 * Searches for letterer IDs matching a filter string
 * @param filter The search filter string to match against letterer names (case-insensitive substring match)
 * @returns An array of letterer IDs that match the filter, or an empty array if no matches found
 */
export const getLettererIdsByFilter = async (
  filter: string,
): Promise<number[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { id: number }[] = await db
      .select({ id: comicLetterersTable.id })
      .from(comicLetterersTable)
      .where(ilike(comicLetterersTable.name, `%${filter}%`));

    return result.map((row) => row.id);
  } catch (error) {
    console.error("Error fetching letterer IDs by filter:", error);
    throw error;
  }
};
