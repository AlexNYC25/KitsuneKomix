import { getClient } from "#infrastructure/db/sqlite/client.ts";
import { getComicBookById as dbGetComicBookById } from "#infrastructure/db/sqlite/models/comicBooks.model.ts";
import {
  getComicBookHistoryByUserAndComic,
  insertComicBookHistory,
  updateComicBookHistory,
} from "#infrastructure/db/sqlite/models/comicBookHistory.model.ts";

import type {
  ComicBook,
  ComicBookHistory,
} from "#types/index.ts";

/**
 * Check if a comic book has been read by a specific user.
 *
 * Queries the user's reading history to determine if the comic
 * has been marked as read.
 *
 * @param comicId - The unique identifier of the comic book
 * @param userId - The unique identifier of the user
 * @returns A promise that resolves to true if the user has read the comic
 *
 * @example
 * const hasRead = await checkComicReadByUser(123, 456);
 * // Returns: true if user 456 has read comic 123
 *
 * @usedBy
 * - /api/comic-books/{id}/read (GET)
 */
export const checkComicReadByUser = async (
  comicId: number,
  userId: number,
): Promise<boolean> => {
  const history: ComicBookHistory | null =
    await getComicBookHistoryByUserAndComic(userId, comicId);
  if (history && history.read === 1) {
    return true;
  }
  return false;
};

/**
 * Set the read status of a comic book for a user.
 *
 * Creates or updates the user's reading history record for the comic.
 * Used to mark comics as read or unread.
 *
 * @param comicId - The unique identifier of the comic book
 * @param userId - The unique identifier of the user
 * @param read - Boolean indicating whether to mark as read (true) or unread (false)
 * @returns A promise that resolves to true if the operation succeeded
 * @throws Error if comic not found or database operation fails
 *
 * @example
 * // Mark comic as read
 * await setComicReadByUser(123, 456, true);
 *
 * // Mark comic as unread
 * await setComicReadByUser(123, 456, false);
 *
 * @usedBy
 * - /api/comic-books/{id}/read (POST)
 * - /api/comic-books/{id}/unread (POST)
 */
export const setComicReadByUser = async (
  comicId: number,
  userId: number,
  read: boolean,
): Promise<boolean> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  const comic = await dbGetComicBookById(comicId);
  if (!comic) {
    throw new Error("Comic book not found.");
  }

  const existingHistory = await getComicBookHistoryByUserAndComic(
    userId,
    comicId,
  );

  if (existingHistory) {
    const readValue = read ? 1 : 0;
    const comicbookHistoryId = await updateComicBookHistory(
      existingHistory.id,
      { read: readValue, lastReadPage: null },
    );

    if (!comicbookHistoryId) {
      throw new Error("Failed to update comic book history.");
    }

    if (!existingHistory.id) {
      throw new Error("Failed to update comic book history.");
    }

    return true;
  } else {
    const newHistory = {
      userId: userId,
      comicBookId: comicId,
      read: read ? 1 : 0,
      lastReadPage: null,
    };
    const comicbookHistoryId = await insertComicBookHistory(newHistory);

    if (!comicbookHistoryId) {
      throw new Error("Failed to create comic book history.");
    }

    return true;
  }
};