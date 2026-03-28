import { eq, ilike } from "drizzle-orm";

import { getClient } from "../client.ts";

import { ComicCoverArtist } from "#types/index.ts";
import {
  comicBookCoverArtistsTable,
  comicCoverArtistsTable,
} from "../schema.ts";

/**
 * Inserts a new comic cover artist into the database or returns the ID of an existing cover artist with the same name
 * @param name The name of the cover artist to insert
 * @returns The ID of the newly inserted cover artist or the ID of the existing cover artist with the same name
 */
export const insertComicCoverArtist = async (name: string): Promise<number> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { id: number }[] = await db
      .insert(comicCoverArtistsTable)
      .values({ name })
      .onConflictDoNothing()
      .returning({ id: comicCoverArtistsTable.id });

    // If result is empty, it means the cover artist already exists due to onConflictDoNothing
    if (result.length === 0) {
      // Find the existing cover artist by name (which should be unique)
      const existingCoverArtist: { id: number }[] = await db
        .select({ id: comicCoverArtistsTable.id })
        .from(comicCoverArtistsTable)
        .where(eq(comicCoverArtistsTable.name, name));

      if (existingCoverArtist.length > 0) {
        console.log(
          `Comic cover artist already exists with name: ${name}, returning existing ID: ${
            existingCoverArtist[0].id
          }`,
        );
        return existingCoverArtist[0].id;
      }

      throw new Error(
        `Failed to insert comic cover artist and could not find existing cover artist. Name: ${name}`,
      );
    }

    return result[0].id;
  } catch (error) {
    console.error("Error inserting comic cover artist:", error);
    throw error;
  }
};

/**
 * Creates a link between a cover artist and a comic book in the database
 * @param coverArtistId The ID of the cover artist to link
 * @param comicBookId The ID of the comic book to link
 * @returns A promise that resolves when the link has been created
 */
export const linkCoverArtistToComicBook = async (
  coverArtistId: number,
  comicBookId: number,
): Promise<void> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    await db
      .insert(comicBookCoverArtistsTable)
      .values({
        comicCoverArtistId: coverArtistId,
        comicBookId: comicBookId,
      })
      .onConflictDoNothing(); // Avoid duplicate links
  } catch (error) {
    console.error("Error linking cover artist to comic book:", error);
    throw error;
  }
};

/**
 * Unlinks all cover artists from a comic book by removing all relationships in the junction table
 * @param comicBookId The ID of the comic book
 * @returns void
 */
export const unlinkCoverArtistsToComicBook = async (
  comicBookId: number,
): Promise<void> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    await db
      .delete(comicBookCoverArtistsTable)
      .where(eq(comicBookCoverArtistsTable.comicBookId, comicBookId));
  } catch (error) {
    console.error("Error unlinking cover artists from comic book:", error);
    throw error;
  }
};

/**
 * Retrieves all cover artists associated with a specific comic book
 * @param comicBookId The ID of the comic book
 * @returns An array of ComicCoverArtist objects associated with the comic book
 */
export const getCoverArtistsByComicBookId = async (
  comicBookId: number,
): Promise<ComicCoverArtist[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { comicCoverArtist: ComicCoverArtist }[] = await db
      .select({
        comicCoverArtist: comicCoverArtistsTable,
      })
      .from(comicCoverArtistsTable)
      .innerJoin(
        comicBookCoverArtistsTable,
        eq(
          comicCoverArtistsTable.id,
          comicBookCoverArtistsTable.comicCoverArtistId,
        ),
      )
      .where(eq(comicBookCoverArtistsTable.comicBookId, comicBookId));

    return result.map((row) => row.comicCoverArtist);
  } catch (error) {
    console.error("Error fetching cover artists by comic book ID:", error);
    throw error;
  }
};

/**
 * Searches for cover artist IDs matching a filter string
 * @param filter The search filter string to match against cover artist names (case-insensitive substring match)
 * @returns An array of cover artist IDs that match the filter, or an empty array if no matches found
 */
export const getCoverArtistIdsByFilter = async (
  filter: string,
): Promise<number[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { id: number }[] = await db
      .select({ id: comicCoverArtistsTable.id })
      .from(comicCoverArtistsTable)
      .where(ilike(comicCoverArtistsTable.name, `%${filter}%`));

    return result.map((row) => row.id);
  } catch (error) {
    console.error("Error fetching comic cover artist IDs by filter:", error);
    throw error;
  }
};
