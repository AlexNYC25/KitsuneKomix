import { eq, sql } from "drizzle-orm";

import { getClient } from "../drizzle/client.ts";
import { dbLogger } from "../loggers/index.ts";
import { env } from "../config/env.ts"

import {
  comicBooksTable,
} from "../schemas/index.ts";

import type {
  ComicBook,
  NewComicBook,
} from "../shared/types/index.ts"



/**
 * Gets a random comic book from the database
 * @returns Promise resolving to a ComicBook object or null if none found
 *
 * TODO: Update this function to return a object of type ComicBookWithMetadata
 * TODO: Verify
 */
export const getRandomBook = async (): Promise<ComicBook | null> => {
  const db = await getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .select()
      .from(comicBooksTable)
      .orderBy(sql`RANDOM()`)
      .limit(1);

    if (!result[0]) {
      return null;
    }

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    dbLogger.error("Error fetching random comic book:" + error);
    throw error;
  }
};

/**
 * Inserts a new comic book into the database
 * @param comicBook The comic book data to insert
 * @returns The ID of the newly inserted comic book
 * 
 */
export const insertComicBook = async (
  comicBook: NewComicBook,
): Promise<number> => {
  const db = await getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  try {
    const insertQuery: { id: number }[] = await db
      .insert(comicBooksTable)
      .values(comicBook)
      .returning({ id: comicBooksTable.id });

    if (!insertQuery[0]) {
      throw new Error("No record returned when inserting comic book.");
    }

    return insertQuery[0].id;
  } catch (error) {
    dbLogger.error("Error inserting comic book:" + error);
    throw error;
  }
};

/**
 * Inserts a new comic book into the database and returns the full comic book record after insertion
 * @param comicBook The comic book data to insert
 * @returns The full comic book record of the newly inserted comic book
 * 
 * TODO: Verify
 */
export const insertComicBookReturningComicBook = async (
  comicBook: NewComicBook,
): Promise<ComicBook> => {
  const db = await getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  try {
    const insertQuery: ComicBook[] = await db
      .insert(comicBooksTable)
      .values(comicBook)
      .returning();

    if (!insertQuery[0]) {
      throw new Error("No record returned when inserting comic book.");
    }

    return insertQuery[0];
  } catch (error) {
    dbLogger.error("Error inserting comic book:" + error);
    throw error;
  }
}

/**
 * Gets the comic book by its ID
 * @param id Id of the comic book
 * @returns The comic book object or null if not found
 *
 * NOTE: This is primarily used in the comicBooks.service.ts file as part of larger functions that need to fetch a comic book by id,
 * possibly could be deprecated in favor of the more flexible function
 * 
 * TODO: Verify
 */
export const getComicBookById = async (
  id: number,
): Promise<ComicBook | null> => {
  const db = await getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: ComicBook[] = await db
      .select()
      .from(comicBooksTable)
      .where(
        eq(comicBooksTable.id, id),
      );

    if (!result[0]) {
      return null;
    }

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    dbLogger.error("Error fetching comic book by ID:" + error);
    throw error;
  }
};

/**
 * Returns the comic book matching the given file path
 * @param filePath String representing the internal path of the comic book file
 * @returns The comic book object or null if not found
 * 
 * TODO: Verify
 */
export const getComicBookByFilePath = async (
  filePath: string,
): Promise<ComicBook | null> => {
  const db = await getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: ComicBook[] = await db
      .select()
      .from(comicBooksTable)
      .where(
        eq(comicBooksTable.filePath, filePath),
      );

    if (!result[0]) {
      return null;
    }

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    dbLogger.error("Error fetching comic book by file path:" + error);
    throw error;
  }
};

/**
 * Updates an existing comic book with the given updates
 * @param id the ID of the comic book to update
 * @param updates The fields to update in the comic book
 * @returns A boolean indicating whether the update was successful
 * 
 * TODO: Verify
 */
export const updateComicBook = async (
  id: number,
  updates: Partial<NewComicBook>,
) => {
  const db = await getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  try {
    const updateData: Record<string, unknown> = {};

    // Map all possible fields from NewComicBook type
    if (updates.libraryId !== undefined) {
      updateData.libraryId = updates.libraryId;
    }
    if (updates.filePath !== undefined) {
      updateData.filePath = updates.filePath;
    }
    if (updates.hash !== undefined) updateData.hash = updates.hash;
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.series !== undefined) updateData.series = updates.series;
    if (updates.issueNumber !== undefined) {
      updateData.issueNumber = updates.issueNumber;
    }
    if (updates.count !== undefined) updateData.count = updates.count;
    if (updates.volumeNumber !== undefined) updateData.volumeNumber = updates.volumeNumber;
    if (updates.alternateSeries !== undefined) {
      updateData.alternateSeries = updates.alternateSeries;
    }
    if (updates.alternateIssueNumber !== undefined) {
      updateData.alternateIssueNumber = updates.alternateIssueNumber;
    }
    if (updates.alternateCount !== undefined) {
      updateData.alternateCount = updates.alternateCount;
    }
    if (updates.pageCount !== undefined) {
      updateData.pageCount = updates.pageCount;
    }
    if (updates.summary !== undefined) updateData.summary = updates.summary;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.year !== undefined) updateData.year = updates.year;
    if (updates.month !== undefined) updateData.month = updates.month;
    if (updates.day !== undefined) updateData.day = updates.day;
    if (updates.publisher !== undefined) {
      updateData.publisher = updates.publisher;
    }
    if (updates.publicationDate !== undefined) {
      updateData.publicationDate = updates.publicationDate;
    }
    if (updates.scanInfo !== undefined) {
      updateData.scanInfo = updates.scanInfo;
    }
    if (updates.language !== undefined) updateData.language = updates.language; // Note: keeping schema typo
    if (updates.format !== undefined) updateData.format = updates.format;
    if (updates.blackAndWhite !== undefined) {
      updateData.blackAndWhite = updates.blackAndWhite;
    }
    if (updates.manga !== undefined) updateData.manga = updates.manga;
    if (updates.readingDirection !== undefined) {
      updateData.readingDirection = updates.readingDirection;
    }
    if (updates.review !== undefined) updateData.review = updates.review;
    if (updates.ageRating !== undefined) {
      updateData.ageRating = updates.ageRating;
    }
    if (updates.communityRating !== undefined) {
      updateData.communityRating = updates.communityRating;
    }
    if (updates.fileSize !== undefined) {
      updateData.fileSize = updates.fileSize;
    }

    if (Object.keys(updateData).length === 0) {
      return false;
    }

    const result = await db
      .update(comicBooksTable)
      .set(updateData)
      .where(eq(comicBooksTable.id, id))
      .returning({ id: comicBooksTable.id });

    return result.length > 0;
  } catch (error) {
    dbLogger.error("Error updating comic book:" + error);
    throw error;
  }
};

/**
 * Deletes a comic book from the database by its ID
 * @param id The ID of the comic book to delete
 * @returns A boolean indicating whether the deletion was successful
 * 
 * TODO: Verify
 */
export const deleteComicBook = async (id: number): Promise<boolean> => {
  const db = await getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { id: number }[] = await db
      .delete(comicBooksTable)
      .where(eq(comicBooksTable.id, id))
      .returning({ id: comicBooksTable.id });

    return result.length > 0;
  } catch (error) {
    dbLogger.error("Error deleting comic book:" + error);
    throw error;
  }
};

/**
 * Retrieves duplicate comic books grouped by hash with pagination support
 * @param offset The number of records to skip for pagination
 * @param limit The maximum number of records to retrieve
 * @returns An array of comic book objects that have duplicates (multiple books with same hash)
 * 
 * TODO: Verify
 */
export const getComicDuplicates = async (
  offset: number,
  limit: number,
): Promise<ComicBook[]> => {
  const db = await getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: ComicBook[] = await db
      .select()
      .from(comicBooksTable)
      .groupBy(comicBooksTable.hash)
      .having(sql`COUNT(*) > 1`)
      .limit(limit)
      .offset(offset);

    return result;
  } catch (error) {
    dbLogger.error("Error fetching duplicate comic books:" + error);
    throw error;
  }
};
