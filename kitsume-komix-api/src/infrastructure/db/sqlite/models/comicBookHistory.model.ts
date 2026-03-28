import { and, eq } from "drizzle-orm";

import { getClient } from "../client.ts";
import { comicBookHistoryTable } from "../schema.ts";

import type { ComicBookHistory, NewComicBookHistory } from "#types/index.ts";

/**
 * Record a new comic book history entry.
 * @param historyData NewComicBookHistory The data for the new comic book history record.
 * @returns Promise<number> The ID of the newly inserted comic book history record.
 */
export const insertComicBookHistory = async (
  historyData: NewComicBookHistory,
): Promise<number> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .insert(comicBookHistoryTable)
      .values(historyData)
      .returning({ id: comicBookHistoryTable.id });

    return result[0].id;
  } catch (error) {
    console.error("Error inserting comic book history:", error);
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
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
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
    console.error("Error fetching comic book history:", error);
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
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    await db
      .update(comicBookHistoryTable)
      .set(updates)
      .where(eq(comicBookHistoryTable.id, id))
      .run();

    return id;
  } catch (error) {
    console.error("Error updating comic book history:", error);
    throw error;
  }
};
