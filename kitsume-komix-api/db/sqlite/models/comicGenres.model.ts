import { eq, ilike } from "drizzle-orm";

import { getClient } from "../client.ts";

import type { ComicGenre } from "#types/index.ts";
import { comicBookGenresTable, comicGenresTable } from "../schema.ts";

/**
 * Inserts a new comic genre into the database or returns the ID of an existing genre with the same name
 * @param genreName The name of the genre to insert
 * @returns The ID of the newly inserted genre or the ID of the existing genre with the same name
 */
export const insertComicGenre = async (genreName: string): Promise<number> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { id: number }[] = await db
      .insert(comicGenresTable)
      .values({ name: genreName })
      .onConflictDoNothing()
      .returning({ id: comicGenresTable.id });

    // If result is empty, it means the genre already exists due to onConflictDoNothing
    if (result.length === 0) {
      // Find the existing genre by name (which should be unique)
      const existingGenre = await db
        .select({ id: comicGenresTable.id })
        .from(comicGenresTable)
        .where(eq(comicGenresTable.name, genreName));

      if (existingGenre.length > 0) {
        console.log(
          `Comic genre already exists with name: ${genreName}, returning existing ID: ${
            existingGenre[0].id
          }`,
        );
        return existingGenre[0].id;
      }

      throw new Error(
        `Failed to insert comic genre and could not find existing genre. Name: ${genreName}`,
      );
    }

    return result[0].id;
  } catch (error) {
    console.error("Error inserting comic genre:", error);
    throw error;
  }
};

/**
 * Creates a link between a genre and a comic book in the database
 * @param genreId The ID of the genre to link
 * @param comicBookId The ID of the comic book to link
 * @returns A promise that resolves when the link has been created
 */
export const linkGenreToComicBook = async (
  genreId: number,
  comicBookId: number,
): Promise<void> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    await db
      .insert(comicBookGenresTable)
      .values({ comicGenreId: genreId, comicBookId: comicBookId })
      .onConflictDoNothing(); // Avoid duplicate links
  } catch (error) {
    console.error("Error linking genre to comic book:", error);
    throw error;
  }
};

/**
 * Retrieves all genres associated with a specific comic book
 * @param comicBookId The ID of the comic book
 * @returns An array of ComicGenre objects associated with the comic book
 */
export const getGenresForComicBook = async (
  comicBookId: number,
): Promise<ComicGenre[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { comicGenre: ComicGenre }[] = await db
      .select({
        comicGenre: comicGenresTable,
      })
      .from(comicGenresTable)
      .innerJoin(
        comicBookGenresTable,
        eq(comicGenresTable.id, comicBookGenresTable.comicGenreId),
      )
      .where(eq(comicBookGenresTable.comicBookId, comicBookId));

    return result.map((row) => row.comicGenre);
  } catch (error) {
    console.error("Error fetching genres for comic book:", error);
    throw error;
  }
};

/**
 * Searches for genre IDs matching a filter string
 * @param filter The search filter string to match against genre names (case-insensitive substring match)
 * @returns An array of genre IDs that match the filter, or an empty array if no matches found
 */
export const getGenreIdsByFilter = async (
  filter: string,
): Promise<number[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { id: number }[] = await db
      .select({ id: comicGenresTable.id })
      .from(comicGenresTable)
      .where(ilike(comicGenresTable.name, `%${filter}%`));

    return result.map((row) => row.id);
  } catch (error) {
    console.error("Error fetching comic genre IDs by filter:", error);
    throw error;
  }
};
