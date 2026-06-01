import { apiLogger } from "#logger/loggers.ts";
import { env } from "#config/env.ts";
import { getClient } from "#infrastructure/db/sqlite/client.ts";
import { getComicBookById as dbGetComicBookById } from "#infrastructure/db/sqlite/models/comicBooks.model.ts";
import {
  deleteComicBookThumbnail,
  getComicThumbnailById,
  getThumbnailsByComicBookId,
  insertCustomComicBookThumbnail,
  getComicBooksThumbnailsByComicBookIdsBatch
} from "#infrastructure/db/sqlite/models/comicBookThumbnails.model.ts";

import { getFileNameFromPath } from "#utilities/file.ts";

import type {
  ComicBookThumbnail,
  ComicBookWithMetadata,
} from "#types/index.ts";

/**
 * Get all thumbnails for a comic book.
 *
 * Retrieves all thumbnails (both auto-generated and custom) associated
 * with a specific comic book.
 *
 * @param comicId - The unique identifier of the comic book
 * @returns A promise that resolves to an array of ComicBookThumbnail or null
 * @throws Error if comic book not found
 *
 * @example
 * const thumbnails = await getComicThumbnails(123);
 * // Returns: [{ id: 1, filePath: '/cache/thumbnails/123_cover.jpg', ... }, ...]
 *
 * @usedBy
 * - /api/comic-books/{id}/thumbnails (GET)
 */
export const getComicThumbnails = async (
  comicId: number,
): Promise<ComicBookThumbnail[] | null> => {
  const comic = await dbGetComicBookById(comicId);

  if (!comic) {
    throw new Error("Comic book not found.");
  }

  const comicThumbnails = await getThumbnailsByComicBookId(comicId);
  return comicThumbnails;
};

/**
 * Get a specific thumbnail by comic ID and thumbnail ID.
 *
 * Retrieves a single thumbnail record using both the comic book ID
 * and thumbnail ID for precise identification.
 *
 * @param comicId - The unique identifier of the comic book
 * @param thumbnailId - The unique identifier of the thumbnail
 * @returns A promise that resolves to the ComicBookThumbnail or null if not found
 * @throws Error if comic book not found
 *
 * @example
 * const thumbnail = await getComicThumbnailByComicIdThumbnailId(123, 1);
 *
 * @usedBy
 * - /api/comic-books/{id}/thumbnails/{thumbId} (GET)
 */
export const getComicThumbnailByComicIdThumbnailId = async (
  comicId: number,
  thumbnailId: number,
): Promise<ComicBookThumbnail | null> => {
  const comic = await dbGetComicBookById(comicId);

  if (!comic) {
    throw new Error("Comic book not found.");
  }

  const comicThumbnail = await getComicThumbnailById(thumbnailId);
  return comicThumbnail;
};

/**
 * Delete a specific thumbnail by comic ID and thumbnail ID.
 *
 * Permanently removes a thumbnail record and its file from storage.
 * Validates both the comic and thumbnail exist before deletion.
 *
 * @param comicId - The unique identifier of the comic book
 * @param thumbnailId - The unique identifier of the thumbnail to delete
 * @returns A promise that resolves to true if deletion succeeded
 * @throws Error if comic or thumbnail not found, or deletion fails
 *
 * @example
 * const success = await deleteComicsThumbnailById(123, 1);
 *
 * @usedBy
 * - /api/comic-books/{id}/thumbnails/{thumbId} (DELETE)
 */
export const deleteComicsThumbnailById = async (
  comicId: number,
  thumbnailId: number,
): Promise<boolean> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  const comic = await dbGetComicBookById(comicId);
  if (!comic) {
    throw new Error("Comic book not found.");
  }

  const thumbnail = await getComicThumbnailById(thumbnailId);
  if (!thumbnail) {
    throw new Error("Comic book thumbnail not found.");
  }

  try {
    await deleteComicBookThumbnail(thumbnailId);
    return true;
  } catch (error) {
    apiLogger.error("Error deleting comic book thumbnail:" + error);
    throw new Error("Failed to delete comic book thumbnail.");
  }
};

/**
 * Create a custom thumbnail for a comic book.
 *
 * Saves a user-provided image as a custom thumbnail for the comic.
 * The image is stored in the thumbnails directory and recorded in the database.
 *
 * @param comicId - The unique identifier of the comic book
 * @param imageData - The image file data as an ArrayBuffer
 * @param userId - The unique identifier of the user creating the thumbnail
 * @param name - Optional name for the thumbnail
 * @param description - Optional description for the thumbnail
 * @returns A promise that resolves to the created thumbnail ID and file path
 * @throws Error if comic not found or file operations fail
 *
 * @example
 * const result = await createCustomThumbnail(
 *   123,
 *   imageArrayBuffer,
 *   456,
 *   'Custom Cover',
 *   'My preferred cover image'
 * );
 * // Returns: { thumbnailId: 5, filePath: '/app/cache/thumbnails/custom/...' }
 *
 * @usedBy
 * - /api/comic-books/{id}/thumbnails (POST)
 */
export const createCustomThumbnail = async (
  comicId: number,
  imageData: ArrayBuffer,
  userId: number,
  name?: string,
  description?: string,
): Promise<{ thumbnailId: number; filePath: string }> => {
  const comic = await dbGetComicBookById(comicId);
  if (!comic) {
    throw new Error("Comic book not found.");
  }

  const timestamp = Date.now();
  const filename = `custom_thumbnail_${comicId}_${timestamp}.jpg`;
  const thumbnailDir = env.CACHE_THUMBNAILS_DIR;
  const filePath = `${thumbnailDir}/${filename}`;

  try {
    await Deno.mkdir(thumbnailDir, { recursive: true });

    await Deno.writeFile(filePath, new Uint8Array(imageData));

    const thumbnailId = await insertCustomComicBookThumbnail(
      comicId,
      filePath,
      userId,
      name,
      description,
    );

    return { thumbnailId, filePath };
  } catch (error) {
    apiLogger.error("Error creating custom thumbnail:" + error);
    throw new Error("Failed to create custom thumbnail.");
  }
};

/**
 * Delete all thumbnails for a comic book.
 *
 * Removes all thumbnail records associated with a comic book from
 * the database. Individual thumbnail deletion from filesystem is
 * handled by the model layer.
 *
 * @param comicId - The unique identifier of the comic book
 * @returns A promise that resolves to true when all deletions complete
 *
 * @example
 * await deleteComicBookThumbnails(123);
 * // All thumbnails for comic 123 are deleted
 *
 * @usedBy
 * - processComicBookDeletion in comicbooks.service.ts
 */
export const deleteComicBookThumbnails = async (
  comicId: number,
): Promise<boolean> => {
  const thumbnails = await getThumbnailsByComicBookId(comicId);
  if (!thumbnails || thumbnails.length === 0) {
    console.log("No thumbnails found for this comic book.");
    return true;
  }

  for (const thumbnail of thumbnails) {
    try {
      await deleteComicBookThumbnail(thumbnail.id);
    } catch (error) {
      apiLogger.error(`Error deleting thumbnail ID ${thumbnail.id} for comic ID ${comicId}:` + error);
    }
  }

  return true;
};

/**
 * Updates a batch of comic books with their associated thumbnails.
 * @param comicBooks 
 * @returns 
 */
export const assembleComicBookThumbnailsBatch = async (
  comicBooks: Partial<ComicBookWithMetadata>[],
): Promise<Partial<ComicBookWithMetadata>[]> => {
  const thumbnailsBatch = await getComicBooksThumbnailsByComicBookIdsBatch(
    comicBooks.map((comic) => comic?.id).filter((id): id is number => id !== undefined),
  );

  const comicBooksWithThumbnails: ComicBookWithMetadata[] = comicBooks
    .filter((comic): comic is ComicBookWithMetadata => comic?.id !== undefined)
    .map((comic) => {
      return {
        ...comic,
        thumbnails: thumbnailsBatch[comic.id] ? thumbnailsBatch[comic.id] : [],
        thumbnailUrl: thumbnailsBatch[comic.id] && thumbnailsBatch[comic.id].length > 0 ? `/api/image/thumbnails/${getFileNameFromPath(thumbnailsBatch[comic.id][0].filePath)}`
          : undefined,
      };
    });

  return comicBooksWithThumbnails;
}