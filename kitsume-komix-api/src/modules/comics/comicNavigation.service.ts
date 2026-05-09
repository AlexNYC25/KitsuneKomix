import { getClient } from "#infrastructure/db/sqlite/client.ts";
import { getComicBookById as dbGetComicBookById } from "#infrastructure/db/sqlite/models/comicBooks.model.ts";
import {
  getComicBooksInSeries,
  getSeriesIdFromComicBook,
} from "#infrastructure/db/sqlite/models/comicSeries.model.ts";
import { getStoryArcsByComicBookId } from "#infrastructure/db/sqlite/models/comicStoryArcs.model.ts";

import type {
  ComicBook,
  ComicStoryArc,
} from "#types/index.ts";

/**
 * Get the next comic book in the same series.
 *
 * Finds and returns the comic book with the next higher issue number
 * within the same series. Used for navigation between sequential comics.
 *
 * @param currentComicId - The unique identifier of the current comic book
 * @returns A promise that resolves to the next ComicBook or null if not found
 * @throws Error if current comic not found or series lookup fails
 *
 * @example
 * const nextComic = await getNextComicBookId(123);
 * // Returns comic with next issue number in the same series, or null
 *
 * @usedBy
 * - /api/comic-books/{id}/next
 */
export const getNextComicBookId = async (
  currentComicId: number,
): Promise<ComicBook | null> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const currentComic = await dbGetComicBookById(currentComicId);
    if (!currentComic) {
      throw new Error("Current comic book not found.");
    }

    const seriesId = await getSeriesIdFromComicBook(currentComicId);
    if (!seriesId) {
      return null;
    }

    const comicsInSeries = await getComicBooksInSeries(seriesId);
    if (comicsInSeries.length === 0) {
      return null;
    }

    const sortedComics = await Promise.all(
      comicsInSeries.map(async (comicId) => {
        const comic = await dbGetComicBookById(comicId);
        return comic
          ? { id: comic.id, issueNumber: comic.issueNumber || 0 }
          : null;
      }),
    );

    const currentIssueNumber = parseInt(currentComic.issueNumber || "0", 10) ||
      0;
    const nextComic = sortedComics
      .filter((c): c is { id: number; issueNumber: number } => c !== null)
      .sort((a, b) => a.issueNumber - b.issueNumber)
      .find((c) => c.issueNumber > currentIssueNumber);

    return nextComic ? await dbGetComicBookById(nextComic.id) : null;
  } catch (error) {
    console.error("Error fetching next comic book ID:", error);
    throw new Error("Failed to fetch next comic book ID");
  }
};

/**
 * Get the previous comic book in the same series.
 *
 * Finds and returns the comic book with the next lower issue number
 * within the same series. Used for navigation between sequential comics.
 *
 * @param currentComicId - The unique identifier of the current comic book
 * @returns A promise that resolves to the previous ComicBook or null if not found
 * @throws Error if current comic not found or series lookup fails
 *
 * @example
 * const prevComic = await getPreviousComicBookId(123);
 * // Returns comic with previous issue number in the same series, or null
 *
 * @usedBy
 * - /api/comic-books/{id}/previous
 */
export const getPreviousComicBookId = async (
  currentComicId: number,
): Promise<ComicBook | null> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const currentComic = await dbGetComicBookById(currentComicId);
    if (!currentComic) {
      throw new Error("Current comic book not found.");
    }

    const seriesId = await getSeriesIdFromComicBook(currentComicId);
    if (!seriesId) {
      return null;
    }

    const comicsInSeries = await getComicBooksInSeries(seriesId);
    if (comicsInSeries.length === 0) {
      return null;
    }

    const sortedComics = await Promise.all(
      comicsInSeries.map(async (comicId) => {
        const comic = await dbGetComicBookById(comicId);
        return comic
          ? { id: comic.id, issueNumber: comic.issueNumber || 0 }
          : null;
      }),
    );

    const currentIssueNumber = parseInt(currentComic.issueNumber || "0", 10) ||
      0;
    const previousComics = sortedComics
      .filter((c): c is { id: number; issueNumber: number } => c !== null)
      .sort((a, b) => b.issueNumber - a.issueNumber)
      .filter((c) => c.issueNumber < currentIssueNumber);

    const previousComic = previousComics.length > 0 ? previousComics[0] : null;

    return previousComic ? await dbGetComicBookById(previousComic.id) : null;
  } catch (error) {
    console.error("Error fetching previous comic book ID:", error);
    throw new Error("Failed to fetch previous comic book ID");
  }
};

/**
 * Get readlists (story arcs) that contain a specific comic book.
 *
 * Retrieves all story arcs/readlists that the comic book belongs to,
 * useful for displaying reading order and collection membership.
 *
 * @param comicId - The unique identifier of the comic book
 * @returns A promise that resolves to an array of ComicStoryArc objects
 *
 * @example
 * const readlists = await getTheReadlistsContainingComicBook(123);
 * // Returns: [{ id: 1, name: 'Spider-Man: The Great Responsibility Saga', ... }, ...]
 *
 * @usedBy
 * - /api/comic-books/{id}/readlists
 */
export const getTheReadlistsContainingComicBook = async (
  comicId: number,
): Promise<ComicStoryArc[]> => {
  const readlists: ComicStoryArc[] = await getStoryArcsByComicBookId(comicId);

  if (!readlists || readlists.length === 0) {
    return [];
  }

  return readlists;
};