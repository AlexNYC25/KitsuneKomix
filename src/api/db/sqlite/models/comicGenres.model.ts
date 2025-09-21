import { eq, ilike } from "drizzle-orm";

import { getClient } from "../client.ts";

import type { ComicGenre } from "../../../types/index.ts";
import { comicBookGenresTable, comicGenresTable } from "../schema.ts";

export const insertComicGenre = async (genreName: string): Promise<number> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
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
      .values({ comic_genre_id: genreId, comic_book_id: comicBookId })
      .onConflictDoNothing(); // Avoid duplicate links
  } catch (error) {
    console.error("Error linking genre to comic book:", error);
    throw error;
  }
};

export const getGenresForComicBook = async (
  comicBookId: number,
): Promise<ComicGenre[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .select({
        comic_genre: comicGenresTable,
      })
      .from(comicGenresTable)
      .innerJoin(
        comicBookGenresTable,
        eq(comicGenresTable.id, comicBookGenresTable.comic_genre_id),
      )
      .where(eq(comicBookGenresTable.comic_book_id, comicBookId));

    return result.map((row) => row.comic_genre);
  } catch (error) {
    console.error("Error fetching genres for comic book:", error);
    throw error;
  }
};

export const getGenreIdsByFilter = async (
  filter: string,
): Promise<number[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .select({ id: comicGenresTable.id })
      .from(comicGenresTable)
      .where(ilike(comicGenresTable.name, `%${filter}%`));

    return result.map((row) => row.id);
  } catch (error) {
    console.error("Error fetching comic genre IDs by filter:", error);
    throw error;
  }
};
