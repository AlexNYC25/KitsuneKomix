import { getClient } from "#infrastructure/db/sqlite/client.ts";
import { getComicBookById as dbGetComicBookById } from "#infrastructure/db/sqlite/models/comicBooks.model.ts";
import {
  getComicBookHistoryByUserAndComic,
  insertComicBookHistory,
  updateComicBookHistory,
  getComicBooksHistoryByUserIdBulk
} from "#infrastructure/db/sqlite/models/comicBookHistory.model.ts";

import type {
  ComicBook,
  ComicBookHistory,
  ComicBookWithMetadata,
  ComicBookHistoryOnly
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
): Promise<ComicBookHistoryOnly> => {
  const history: ComicBookHistory | null =
    await getComicBookHistoryByUserAndComic(userId, comicId);
  if (history) {
    return {
      read: history.read,
      lastReadPage: history.lastReadPage || undefined,
    };
  }

  return {
    read: false,
    lastReadPage: undefined,
  };
};

/**
 * Used to specifically fetch the last read page for a comic book for a specific user, used to determine where to open the comic book for the user in the frontend.
 * @param comicId the comic book ID to fetch the last read page for
 * @param userId the specific user ID to fetch the last read page for
 * @returns either the last read page number or null if there is no history for the user and comic book or if the last read page is not set
 */
export const getComicBooksLastReadPageForUser = async (
  comicId: number,
  userId: number,
): Promise<number | null> => {
  const history: ComicBookHistory | null =
    await getComicBookHistoryByUserAndComic(userId, comicId);
  if (history) {
    return history.lastReadPage;
  }
  return null;
}

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
    const comicbookHistoryId = await updateComicBookHistory(
      existingHistory.id,
      { read: read, lastReadPage: null },
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
      read: read,
      lastReadPage: null,
    };
    const comicbookHistoryId = await insertComicBookHistory(newHistory);

    if (!comicbookHistoryId) {
      throw new Error("Failed to create comic book history.");
    }

    return true;
  }
};

/**
 * The service that fetches the comic book history for a set of comic books for a specific user, then attaches the history information to the comic books.
 * @param comicBooks an array of comic books to attach the history information to
 * @param userId the specific user ID to fetch the history information for
 * @returns an array of comic books with the history information attached to each comic book
 */
export const assembleComicBookReadStatusBatch = async (
  comicBooks: Partial<ComicBookWithMetadata>[],
  userId: number,
): Promise<Partial<ComicBookWithMetadata>[]> => {
  const comicBookHistoryRecords = await getComicBooksHistoryByUserIdBulk(
    userId,
    comicBooks.map((comic) => comic.id!).filter((id): id is number => id !== undefined),
  );
  const comicBooksWithReadStatus: Partial<ComicBookWithMetadata>[] = [];

  for (const comicBook of comicBooks) {
    if (!comicBook.id) continue;

    const history = comicBookHistoryRecords[comicBook.id];
    const isRead = history && history.read || false;
    const lastReadPage = history && history.lastReadPage || undefined;

    const comicBookWithMetadata: ComicBookWithMetadata = {
      ...comicBook,
      id: comicBook.id,
      read: isRead,
      lastReadPage: lastReadPage,
    } as ComicBookWithMetadata;

    comicBooksWithReadStatus.push(comicBookWithMetadata);
  }

  return comicBooksWithReadStatus;
}