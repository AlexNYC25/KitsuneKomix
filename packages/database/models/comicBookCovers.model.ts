import { eq, inArray } from "drizzle-orm";

import { getClient } from "../drizzle/client.ts";
import { dbLogger } from "../loggers/index.ts";

import {
  comicBookCoversTable,
  comicPagesTable,
} from "../schemas/index.ts";

import type { NewComicBookCover } from "../shared/types/database.types.ts";

/**
 * Inserts a comic book cover into the database, returning its ID. If a cover
 * already exists for the file path (which is unique), the existing cover's ID
 * is returned.
 * @param cover The cover data to insert
 * @returns The ID of the cover
 */
export const insertComicBookCover = async (
  cover: NewComicBookCover,
): Promise<number> => {
  const db = await getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  try {
    const insertResult = await db
      .insert(comicBookCoversTable)
      .values(cover)
      .onConflictDoNothing()
      .returning({ id: comicBookCoversTable.id });

    if (insertResult[0]) {
      return insertResult[0].id;
    }

    const existingCover = await db
      .select({ id: comicBookCoversTable.id })
      .from(comicBookCoversTable)
      .where(eq(comicBookCoversTable.filePath, cover.filePath))
      .limit(1);

    if (!existingCover[0]) {
      throw new Error("Cover already exists but could not be fetched.");
    }

    return existingCover[0].id;
  } catch (error) {
    dbLogger.error("Error inserting comic book cover:" + error);
    throw error;
  }
};

/**
 * Deletes all comic book covers associated with a comic book's pages.
 * @param comicBookId The ID of the comic book whose covers to delete
 * @returns The number of deleted rows
 */
export const deleteComicBookCoversForBook = async (
  comicBookId: number,
): Promise<number> => {
  const db = await getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  try {
    const pageIds = db
      .select({ id: comicPagesTable.id })
      .from(comicPagesTable)
      .where(eq(comicPagesTable.comicBookId, comicBookId));

    const result = await db
      .delete(comicBookCoversTable)
      .where(
        inArray(
          comicBookCoversTable.comicPageId,
          pageIds,
        ),
      )
      .returning({ id: comicBookCoversTable.id });

    return result.length;
  } catch (error) {
    dbLogger.error("Error deleting comic book covers for book:" + error);
    throw error;
  }
};