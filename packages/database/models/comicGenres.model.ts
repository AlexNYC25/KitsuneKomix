import { eq } from "drizzle-orm";

import { getClient } from "../drizzle/client.ts";
import { dbLogger } from "../loggers/index.ts";

import {
  comicBookGenresTable,
  comicGenresTable,
} from "../schemas/index.ts";

/**
 * Inserts a genre into the database, returning its ID. If the genre already
 * exists (name is unique), the existing genre's ID is returned.
 * @param name The name of the genre to insert
 * @returns The ID of the genre
 */
export const insertGenre = async (name: string): Promise<number> => {
  const db = await getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  try {
    const insertResult: { id: number }[] = await db
      .insert(comicGenresTable)
      .values({ name })
      .onConflictDoNothing()
      .returning({ id: comicGenresTable.id });

    if (insertResult[0]) {
      return insertResult[0].id;
    }

    const existingGenre = await db
      .select({ id: comicGenresTable.id })
      .from(comicGenresTable)
      .where(eq(comicGenresTable.name, name))
      .limit(1);

    if (!existingGenre[0]) {
      throw new Error("Genre already exists but could not be fetched.");
    }

    return existingGenre[0].id;
  } catch (error) {
    dbLogger.error("Error inserting genre:" + error);
    throw error;
  }
};

/**
 * Associates a genre with a comic book by creating a mapping record.
 * @param genreId The ID of the genre
 * @param comicBookId The ID of the comic book
 * @returns A boolean indicating whether a new mapping was created
 */
export const linkGenreToComicBook = async (
  genreId: number,
  comicBookId: number,
): Promise<boolean> => {
  const db = await getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { id: number }[] = await db
      .insert(comicBookGenresTable)
      .values({
        comicBookId,
        comicGenreId: genreId,
      })
      .onConflictDoNothing()
      .returning({ id: comicBookGenresTable.id });

    return result.length > 0;
  } catch (error) {
    dbLogger.error("Error linking genre to comic book:" + error);
    throw error;
  }
};