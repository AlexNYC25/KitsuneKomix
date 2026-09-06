import { eq } from "drizzle-orm";

import { getClient } from "../drizzle/client.ts";
import { dbLogger } from "../loggers/index.ts";

import {
  comicBookSeriesGroupsTable,
  comicSeriesGroupsTable,
} from "../schemas/index.ts";

/**
 * Inserts a series group into the database, returning its ID. If the series
 * group already exists (name is unique), the existing series group's ID is
 * returned.
 * @param name The name of the series group to insert
 * @returns The ID of the series group
 */
export const insertSeriesGroup = async (name: string): Promise<number> => {
  const db = await getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  try {
    const insertResult: { id: number }[] = await db
      .insert(comicSeriesGroupsTable)
      .values({ name })
      .onConflictDoNothing()
      .returning({ id: comicSeriesGroupsTable.id });

    if (insertResult[0]) {
      return insertResult[0].id;
    }

    const existingSeriesGroup = await db
      .select({ id: comicSeriesGroupsTable.id })
      .from(comicSeriesGroupsTable)
      .where(eq(comicSeriesGroupsTable.name, name))
      .limit(1);

    if (!existingSeriesGroup[0]) {
      throw new Error("Series group already exists but could not be fetched.");
    }

    return existingSeriesGroup[0].id;
  } catch (error) {
    dbLogger.error("Error inserting series group:" + error);
    throw error;
  }
};

/**
 * Associates a series group with a comic book by creating a mapping record.
 * The position indicates the order of the series group relative to the comic
 * book.
 * @param seriesGroupId The ID of the series group
 * @param comicBookId The ID of the comic book
 * @param position The zero-based order of the series group in the comic book
 * @returns A boolean indicating whether a new mapping was created
 */
export const linkSeriesGroupToComicBook = async (
  seriesGroupId: number,
  comicBookId: number,
  position: number,
): Promise<boolean> => {
  const db = await getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { id: number }[] = await db
      .insert(comicBookSeriesGroupsTable)
      .values({
        comicBookId,
        comicSeriesGroupId: seriesGroupId,
        position,
      })
      .onConflictDoNothing()
      .returning({ id: comicBookSeriesGroupsTable.id });

    return result.length > 0;
  } catch (error) {
    dbLogger.error("Error linking series group to comic book:" + error);
    throw error;
  }
};