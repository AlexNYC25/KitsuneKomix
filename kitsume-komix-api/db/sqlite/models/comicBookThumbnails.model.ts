import { getClient } from "../client.ts";
import { comicBookThumbnails } from "../schema.ts";

import { eq } from "drizzle-orm";
import type { ComicBookThumbnail } from "#types/index.ts";
import { Row } from "@libsql/client";

/**
 * Inserts a new comic book thumbnail into the database.
 * @param comicBookId - The ID of the comic book.
 * @param comicBookCoverId - The ID of the comic book cover.
 * @param filePath - The file path of the thumbnail image.
 * @returns The ID of the newly inserted thumbnail.
 */
//TODO: Refactor to handle both generated and custom thumbnails
export const insertComicBookThumbnail = async (
  comicBookId: number,
  comicBookCoverId: number,
  filePath: string,
): Promise<number> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    // Check if comic_book_id column exists (for migration compatibility)
    const tableInfo: { rows?: Row[] } = await db.run("PRAGMA table_info(comic_book_thumbnails)");
    const hasComicBookIdColumn: boolean | undefined = tableInfo.rows?.some((row: Row) =>
      row[1] === "comic_book_id"
    );

    if (hasComicBookIdColumn) {
      // Use new schema
      const result: { id: number }[] = await db
        .insert(comicBookThumbnails)
        .values({
          comicBookId: comicBookId,
          comicBookCoverId: comicBookCoverId,
          filePath: filePath,
          thumbnailType: "generated",
        })
        .returning({ id: comicBookThumbnails.id });

      if (result.length === 0) {
        throw new Error(
          `Failed to insert thumbnail for comic book cover ID ${comicBookCoverId}`,
        );
      }

      return result[0].id;
    } else {
      // Use old schema (backwards compatibility during migration)
      const result: { id: number }[] = await db
        .insert(comicBookThumbnails)
        .values({
          comicBookId: comicBookId,
          comicBookCoverId: comicBookCoverId,
          filePath: filePath,
        })
        .returning({ id: comicBookThumbnails.id });

      if (result.length === 0) {
        throw new Error(
          `Failed to insert thumbnail for comic book cover ID ${comicBookCoverId}`,
        );
      }

      return result[0].id;
    }
  } catch (error) {
    console.error("Error inserting comic book thumbnail:", error);
    throw error;
  }
};

/**
 * Fetch all thumbnails linked to a specific comic book
 * @param comicBookId - The ID of the comic book.
 * @returns An array of ComicBookThumbnail objects or null if none found.
 */
export const getThumbnailsByComicBookId = async (
  comicBookId: number,
): Promise<ComicBookThumbnail[] | null> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    // Query for thumbnails linked to the comic book
    // Prefer generated thumbnails (actual thumbnail files in cache) over custom ones
    const result: ComicBookThumbnail[] = await db
      .select()
      .from(comicBookThumbnails)
      .where(
        eq(comicBookThumbnails.comicBookId, comicBookId),
      );

    // Sort to prefer generated thumbnails that look like cache paths
    const sorted: ComicBookThumbnail[] = result.sort((a, b) => {
      // Thumbnails with hash filenames (cache generated) come first
      const aIsGenerated: number = a.filePath?.includes("_thumb.") ? 0 : 1;
      const bIsGenerated: number = b.filePath?.includes("_thumb.") ? 0 : 1;
      return aIsGenerated - bIsGenerated;
    });

    return sorted.length > 0 ? sorted : null;
  } catch (error) {
    console.error("Error fetching thumbnails by comic book ID:", error);
    throw error;
  }
};

/**
 * Fetch a comic book thumbnail by its ID
 * @param thumbnailId - The ID of the thumbnail.
 * @returns A ComicBookThumbnail object or null if not found.
 */
export const getComicThumbnailById = async (
  thumbnailId: number,
): Promise<ComicBookThumbnail | null> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: ComicBookThumbnail[] = await db
      .select()
      .from(comicBookThumbnails)
      .where(eq(comicBookThumbnails.id, thumbnailId));

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Error fetching comic book thumbnail by ID:", error);
    throw error;
  }
};

/**
 * Insert a custom thumbnail directly linked to a comic book
 */
export const insertCustomComicBookThumbnail = async (
  comicBookId: number,
  filePath: string,
  uploadedBy: number,
  name?: string,
  description?: string,
): Promise<number> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { id: number }[] = await db
      .insert(comicBookThumbnails)
      .values({
        comicBookId: comicBookId,
        comicBookCoverId: null, // Custom thumbnails aren't linked to covers
        filePath: filePath,
        thumbnailType: "custom",
        name: name,
        description: description,
        uploadedBy: uploadedBy,
      })
      .returning({ id: comicBookThumbnails.id });

    if (result.length === 0) {
      throw new Error(
        `Failed to insert custom thumbnail for comic book ID ${comicBookId}`,
      );
    }

    return result[0].id;
  } catch (error) {
    console.error("Error inserting custom comic book thumbnail:", error);
    throw error;
  }
};

/**
 * Delete a comic book thumbnail by its ID
 * @param thumbnailId - The ID of the thumbnail to delete.
 */
export const deleteComicBookThumbnail = async (
  thumbnailId: number,
): Promise<void> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    await db
      .delete(comicBookThumbnails)
      .where(eq(comicBookThumbnails.id, thumbnailId));
  } catch (error) {
    console.error("Error deleting comic book thumbnail:", error);
    throw error;
  }
};
