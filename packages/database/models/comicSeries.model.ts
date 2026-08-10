import { eq, sql } from "drizzle-orm";

import { getClient } from "../drizzle/client.ts";
import { dbLogger } from "../loggers/index.ts";
import { env } from "../config/env.ts"

import {
  comicSeriesBooksTable,
} from "../schemas/index.ts";

import type {
  ComicBook,
  NewComicBook,
  ComicSeries,
} from "../shared/types/index.ts"


/**
 * Adds a comic book to a series by creating a relationship
 *
 * used by the internal worker
 *
 * @param seriesId The ID of the series
 * @param comicBookId The ID of the comic book
 * @returns void
 */
export const addComicBookToSeries = async (
  seriesId: number,
  comicBookId: number,
): Promise<boolean> => {
  const db = await getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { id: number }[] = await db
      .insert(comicSeriesBooksTable)
      .values({
        comicSeriesId: seriesId,
        comicBookId: comicBookId,
      })
      .onConflictDoNothing()
      .returning({ id: comicSeriesBooksTable.id });

    return result.length > 0;
  } catch (error) {
    dbLogger.error("Error adding comic book to series:" + error);
    throw error;
  }
};

export const findComicSeriesByFolderPath = async (folderPath: string): Promise<ComicSeries | null> => {
  const db = await getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  try {
    
  } catch (error) {
    dbLogger.error("Error finding comic series by folder path:" + error);
    throw error;
  }
}