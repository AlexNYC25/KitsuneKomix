import { eq, ilike } from "drizzle-orm";

import { getClient } from "../client.ts";
import { comicBookInkersTable, comicInkersTable } from "../schema.ts";

import { ComicInker } from "#types/index.ts";

/**
 * Inserts a new comic inker into the database or returns the ID of an existing inker with the same name
 * @param name The name of the inker to insert
 * @returns The ID of the newly inserted inker or the ID of the existing inker with the same name
 */
export const insertComicInker = async (name: string): Promise<number> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { id: number }[] = await db
      .insert(comicInkersTable)
      .values({ name })
      .onConflictDoNothing()
      .returning({ id: comicInkersTable.id });

    // If result is empty, it means the inker already exists due to onConflictDoNothing
    if (result.length === 0) {
      // Find the existing inker by name (which should be unique)
      const existingInker: { id: number }[] = await db
        .select({ id: comicInkersTable.id })
        .from(comicInkersTable)
        .where(eq(comicInkersTable.name, name));

      if (existingInker.length > 0) {
        console.log(
          `Comic inker already exists with name: ${name}, returning existing ID: ${
            existingInker[0].id
          }`,
        );
        return existingInker[0].id;
      }

      throw new Error(
        `Failed to insert comic inker and could not find existing inker. Name: ${name}`,
      );
    }

    return result[0].id;
  } catch (error) {
    console.error("Error inserting comic inker:", error);
    throw error;
  }
};

/**
 * Creates a link between an inker and a comic book in the database
 * @param inkerId The ID of the inker to link
 * @param comicBookId The ID of the comic book to link
 * @returns A promise that resolves when the link has been created
 */
export const linkInkerToComicBook = async (
  inkerId: number,
  comicBookId: number,
): Promise<void> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    await db
      .insert(comicBookInkersTable)
      .values({ comicInkerId: inkerId, comicBookId: comicBookId })
      .onConflictDoNothing(); // Avoid duplicate links
  } catch (error) {
    console.error("Error linking inker to comic book:", error);
    throw error;
  }
};

/**
 * Unlinks all inkers from a comic book by removing all relationships in the junction table
 * @param comicBookId The ID of the comic book
 * @returns void
 */
export const unlinkInkersToComicBook = async (
  comicBookId: number,
): Promise<void> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    await db
      .delete(comicBookInkersTable)
      .where(eq(comicBookInkersTable.comicBookId, comicBookId));
  } catch (error) {
    console.error("Error unlinking inkers from comic book:", error);
    throw error;
  }
};

/**
 * Retrieves all inkers associated with a specific comic book
 * @param comicBookId The ID of the comic book
 * @returns An array of ComicInker objects associated with the comic book
 */
export const getInkersByComicBookId = async (
  comicBookId: number,
): Promise<ComicInker[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { comicInker: ComicInker }[] = await db
      .select({
        comicInker: comicInkersTable,
      })
      .from(comicInkersTable)
      .innerJoin(
        comicBookInkersTable,
        eq(comicInkersTable.id, comicBookInkersTable.comicInkerId),
      )
      .where(eq(comicBookInkersTable.comicBookId, comicBookId));

    return result.map(({ comicInker }) => comicInker);
  } catch (error) {
    console.error("Error fetching inkers by comic book ID:", error);
    throw error;
  }
};

/**
 * Searches for inker IDs matching a filter string
 * @param filter The search filter string to match against inker names (case-insensitive substring match)
 * @returns An array of inker IDs that match the filter, or an empty array if no matches found
 */
export const getInkerIdsByFilter = async (
  filter: string,
): Promise<number[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { id: number }[] = await db
      .select({ id: comicInkersTable.id })
      .from(comicInkersTable)
      .where(ilike(comicInkersTable.name, `%${filter}%`));

    return result.map((row) => row.id);
  } catch (error) {
    console.error("Error fetching inker IDs by filter:", error);
    throw error;
  }
};
