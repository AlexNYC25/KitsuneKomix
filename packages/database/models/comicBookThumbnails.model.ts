import { eq } from "drizzle-orm";

import { getClient } from "../drizzle/client.ts";
import { dbLogger } from "../loggers/index.ts";

import { comicBookThumbnailsTable } from "../schemas/index.ts";

import type { NewComicBookThumbnail } from "../shared/types/database.types.ts";

/**
 * Inserts a comic book thumbnail into the database, returning its ID.
 * @param thumbnail The thumbnail data to insert
 * @returns The ID of the inserted thumbnail
 */
export const insertComicBookThumbnail = async (
  thumbnail: NewComicBookThumbnail,
): Promise<number> => {
  const db = await getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .insert(comicBookThumbnailsTable)
      .values(thumbnail)
      .returning({ id: comicBookThumbnailsTable.id });

    if (result[0]) {
      return result[0].id;
    }

    throw new Error("Insert did not return an ID.");
  } catch (error) {
    dbLogger.error("Error inserting comic book thumbnail:" + error);
    throw error;
  }
};

/**
 * Deletes all comic book thumbnails associated with a given comic book.
 * @param comicBookId The ID of the comic book whose thumbnails to delete
 * @returns The number of deleted rows
 */
export const deleteComicBookThumbnailsForBook = async (
  comicBookId: number,
): Promise<number> => {
  const db = await getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .delete(comicBookThumbnailsTable)
      .where(eq(comicBookThumbnailsTable.comicBookId, comicBookId))
      .returning({ id: comicBookThumbnailsTable.id });

    return result.length;
  } catch (error) {
    dbLogger.error("Error deleting comic book thumbnails for book:" + error);
    throw error;
  }
};