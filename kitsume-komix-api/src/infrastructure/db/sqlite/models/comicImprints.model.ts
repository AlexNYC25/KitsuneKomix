import { eq, ilike } from "drizzle-orm";

import { getClient } from "../client.ts";
import { comicBookImprintsTable, comicImprintsTable } from "../schema.ts";

import type { ComicImprint } from "#types/index.ts";

/**
 * Inserts a new comic imprint into the database or returns the ID of an existing imprint with the same name
 * @param name The name of the imprint to insert
 * @returns The ID of the newly inserted imprint or the ID of the existing imprint with the same name
 */
export const insertComicImprint = async (name: string): Promise<number> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { id: number }[] = await db
      .insert(comicImprintsTable)
      .values({ name })
      .onConflictDoNothing()
      .returning({ id: comicImprintsTable.id });

    // If result is empty, it means the imprint already exists due to onConflictDoNothing
    if (result.length === 0) {
      // Find the existing imprint by name (which should be unique)
      const existingImprint: { id: number }[] = await db
        .select({ id: comicImprintsTable.id })
        .from(comicImprintsTable)
        .where(eq(comicImprintsTable.name, name));

      if (existingImprint.length > 0) {
        console.log(
          `Comic imprint already exists with name: ${name}, returning existing ID: ${
            existingImprint[0].id
          }`,
        );
        return existingImprint[0].id;
      }

      throw new Error(
        `Failed to insert comic imprint and could not find existing imprint. Name: ${name}`,
      );
    }

    return result[0].id;
  } catch (error) {
    console.error("Error inserting comic imprint:", error);
    throw error;
  }
};

/**
 * Creates a link between an imprint and a comic book in the database
 * @param imprintId The ID of the imprint to link
 * @param comicBookId The ID of the comic book to link
 * @returns A promise that resolves when the link has been created
 */
export const linkImprintToComicBook = async (
  imprintId: number,
  comicBookId: number,
): Promise<void> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    await db
      .insert(comicBookImprintsTable)
      .values({ comicImprintId: imprintId, comicBookId: comicBookId })
      .onConflictDoNothing(); // Avoid duplicate links
  } catch (error) {
    console.error("Error linking imprint to comic book:", error);
    throw error;
  }
};

/**
 * Unlinks all imprints from a comic book by removing all relationships in the junction table
 * @param comicBookId The ID of the comic book
 * @returns void
 */
export const unlinkImprintsToComicBook = async (
  comicBookId: number,
): Promise<void> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    await db
      .delete(comicBookImprintsTable)
      .where(eq(comicBookImprintsTable.comicBookId, comicBookId));
  } catch (error) {
    console.error("Error unlinking imprints from comic book:", error);
    throw error;
  }
};

/**
 * Retrieves all imprints associated with a specific comic book
 * @param comicBookId The ID of the comic book
 * @returns An array of ComicImprint objects associated with the comic book
 */
export const getImprintsByComicBookId = async (
  comicBookId: number,
): Promise<ComicImprint[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { comicImprint: ComicImprint }[] = await db
      .select({
        comicImprint: comicImprintsTable,
      })
      .from(comicImprintsTable)
      .innerJoin(
        comicBookImprintsTable,
        eq(comicImprintsTable.id, comicBookImprintsTable.comicImprintId),
      )
      .where(eq(comicBookImprintsTable.comicBookId, comicBookId));

    return result.map((row) => row.comicImprint);
  } catch (error) {
    console.error("Error fetching imprints by comic book ID:", error);
    throw error;
  }
};

/**
 * Searches for imprint IDs matching a filter string
 * @param filter The search filter string to match against imprint names (case-insensitive substring match)
 * @returns An array of imprint IDs that match the filter, or an empty array if no matches found
 */
export const getImprintIdsByFilter = async (
  filter: string,
): Promise<number[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { id: number }[] = await db
      .select({ id: comicImprintsTable.id })
      .from(comicImprintsTable)
      .where(ilike(comicImprintsTable.name, `%${filter}%`));

    return result.map((row) => row.id);
  } catch (error) {
    console.error("Error fetching comic imprint IDs by filter:", error);
    throw error;
  }
};
