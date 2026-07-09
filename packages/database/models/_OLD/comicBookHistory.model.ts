import { and, eq, inArray } from "drizzle-orm";

import { getClient } from "../../drizzle/client.ts";

import { comicBookHistoryTable } from "../../schemas/index.ts";

import { dbLogger } from "../../loggers/index.ts";

import type { ComicBookHistory, NewComicBookHistory, BatchComicBookHistory, DrizzleType } from "../../shared/types/index.ts";

/**
 * Record a new comic book history entry.
 * @param historyData NewComicBookHistory The data for the new comic book history record.
 * @returns Promise<number> The ID of the newly inserted comic book history record.
 */
export const insertComicBookHistory = async (
  historyData: NewComicBookHistory,
): Promise<number> => {
  const db: DrizzleType = await getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: {id: number}[] = await db
      .insert(comicBookHistoryTable)
      .values(historyData)
      .returning({ id: comicBookHistoryTable.id });

    if (result.length === 0) {
      throw new Error("Failed to insert comic book history.");
    }

    if (result.length > 1) {
      dbLogger.warn(
        `Multiple records inserted for comic book history. Returning the first one.`,
      );
    }

    if (!result[0]) {
      throw new Error("No record returned when inserting comic book history.");
    }

    return result[0].id;
  } catch (error) {
    dbLogger.error("Error inserting comic book history:" + error);
    throw error;
  }
};

/** Fetch a comic book history entry by user ID and comic book ID.
 * @param userId number The ID of the user.
 * @param comicBookId number The ID of the comic book.
 * @returns Promise<ComicBookHistory | null> The comic book history record, or null if not found.
 */
export const getComicBookHistoryByUserAndComic = async (
  userId: number,
  comicBookId: number,
): Promise<ComicBookHistory | null> => {
  const db = await getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: ComicBookHistory[] = db
      .select()
      .from(comicBookHistoryTable)
      .where(
        and(
          eq(comicBookHistoryTable.userId, userId),
          eq(comicBookHistoryTable.comicBookId, comicBookId),
        ),
      )
      .all();

    return result[0] || null;
  } catch (error) {
    dbLogger.error("Error fetching comic book history:" + error);
    throw error;
  }
};

/**
 * Update an existing comic book history entry.
 * @param id number The ID of the comic book history record to update.
 * @param updates Partial<NewComicBookHistory> The fields to update in the comic book history record.
 * @returns Promise<number> The ID of the updated comic book history record.
 */
export const updateComicBookHistory = async (
  id: number,
  updates: Partial<NewComicBookHistory>,
): Promise<number> => {
  const db = await getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  try {
    db
      .update(comicBookHistoryTable)
      .set(updates)
      .where(eq(comicBookHistoryTable.id, id))
      .run();

    return id;
  } catch (error) {
    dbLogger.error("Error updating comic book history:" + error);
    throw error;
  }
};

/**
 * Bulk fetch comic book history records for a user across multiple comic book IDs.
 * @param userId The ID of the user to fetch history for.
 * @param comicBookIds The list of comic book IDs to fetch history records for.
 * @returns 
 */
export const getComicBooksHistoryByUserIdBulk = async (
  userId: number,
  comicBookIds: number[],
): Promise<BatchComicBookHistory> => {
  const db = await getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: ComicBookHistory[] = db
      .select()
      .from(comicBookHistoryTable)
      .where(
        and(
          eq(comicBookHistoryTable.userId, userId),
          inArray(comicBookHistoryTable.comicBookId, (comicBookIds)),
        ),
      )
      .all();

    // Transform the result into a record keyed by comicBookId for easy lookup
    const historyRecord: BatchComicBookHistory = {};
    result.forEach((history) => {
      if (history.comicBookId) {
        historyRecord[history.comicBookId] = history;
      }
    });

    return historyRecord;
  } catch (error) {
    dbLogger.error("Error fetching comic book history in bulk:" + error);
    throw error;
  }
};