import { eq, ilike } from "drizzle-orm";

import { getClient } from "../client.ts";

import { ComicColorist } from "#types/index.ts";
import { comicBookColoristsTable, comicColoristsTable } from "../schema.ts";

/**
 * Inserts a new comic colorist into the database or returns the ID of an existing colorist with the same name
 * @param name The name of the colorist to insert
 * @returns The ID of the newly inserted colorist or the ID of the existing colorist with the same name
 */
export const insertComicColorist = async (name: string): Promise<number> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { id: number }[] = await db
      .insert(comicColoristsTable)
      .values({ name })
      .onConflictDoNothing()
      .returning({ id: comicColoristsTable.id });

    // If result is empty, it means the colorist already exists due to onConflictDoNothing
    if (result.length === 0) {
      // Find the existing colorist by name (which should be unique)
      const existingColorist: { id: number }[] = await db
        .select({ id: comicColoristsTable.id })
        .from(comicColoristsTable)
        .where(eq(comicColoristsTable.name, name));

      if (existingColorist.length > 0) {
        console.log(
          `Comic colorist already exists with name: ${name}, returning existing ID: ${
            existingColorist[0].id
          }`,
        );
        return existingColorist[0].id;
      }

      throw new Error(
        `Failed to insert comic colorist and could not find existing colorist. Name: ${name}`,
      );
    }

    return result[0].id;
  } catch (error) {
    console.error("Error inserting comic colorist:", error);
    throw error;
  }
};

/**
 * Creates a link between a colorist and a comic book in the database
 * @param coloristId The ID of the colorist to link
 * @param comicBookId The ID of the comic book to link
 * @returns A promise that resolves when the link has been created
 */
export const linkColoristToComicBook = async (
  coloristId: number,
  comicBookId: number,
): Promise<void> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    await db
      .insert(comicBookColoristsTable)
      .values({ comicColoristId: coloristId, comicBookId: comicBookId })
      .onConflictDoNothing(); // Avoid duplicate links
  } catch (error) {
    console.error("Error linking colorist to comic book:", error);
    throw error;
  }
};

/**
 * Unlinks all colorists from a comic book by removing all relationships in the junction table
 * @param comicBookId The ID of the comic book
 * @returns void
 */
export const unlinkColoristsToComicBook = async (
  comicBookId: number,
): Promise<void> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    await db
      .delete(comicBookColoristsTable)
      .where(eq(comicBookColoristsTable.comicBookId, comicBookId));
  } catch (error) {
    console.error("Error unlinking colorists from comic book:", error);
    throw error;
  }
};

/**
 * Retrieves all colorists associated with a specific comic book
 * @param comicBookId The ID of the comic book
 * @returns An array of ComicColorist objects associated with the comic book
 */
export const getColoristByComicBookId = async (
  comicBookId: number,
): Promise<ComicColorist[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { comicColorist: ComicColorist }[] = await db
      .select({
        comicColorist: comicColoristsTable,
      })
      .from(comicColoristsTable)
      .innerJoin(
        comicBookColoristsTable,
        eq(
          comicColoristsTable.id,
          comicBookColoristsTable.comicColoristId,
        ),
      )
      .where(eq(comicBookColoristsTable.comicBookId, comicBookId));

    return result.map((row) => row.comicColorist);
  } catch (error) {
    console.error("Error fetching colorists by comic book ID:", error);
    throw error;
  }
};

/**
 * Searches for colorist IDs matching a filter string
 * @param filter The search filter string to match against colorist names (case-insensitive substring match)
 * @returns An array of colorist IDs that match the filter, or an empty array if no matches found
 */
export const getColoristIdsByFilter = async (
  filter: string,
): Promise<number[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { id: number }[] = await db
      .select({ id: comicColoristsTable.id })
      .from(comicColoristsTable)
      .where(ilike(comicColoristsTable.name, `%${filter}%`));

    return result.map((row) => row.id);
  } catch (error) {
    console.error("Error fetching colorist IDs by filter:", error);
    throw error;
  }
};
