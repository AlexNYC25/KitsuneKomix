import { getClient } from "../client.ts";
import { comicBookThumbnails } from "../schema.ts";

import { eq } from "drizzle-orm";
import type { ComicBookThumbnail } from "../../../types/index.ts";

export const insertComicBookThumbnail = async (
  comicBookId: number,
  comicBookCoverId: number, 
  filePath: string
): Promise<number> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    // Check if comic_book_id column exists (for migration compatibility)
    const tableInfo = await db.run("PRAGMA table_info(comic_book_thumbnails)");
    const hasComicBookIdColumn = tableInfo.rows?.some((row: any) => row[1] === 'comic_book_id');

    if (hasComicBookIdColumn) {
      // Use new schema
      const result = await db
        .insert(comicBookThumbnails)
        .values({ 
          comic_book_id: comicBookId,
          comic_book_cover_id: comicBookCoverId, 
          file_path: filePath,
          thumbnail_type: "generated"
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
      const result = await db
        .insert(comicBookThumbnails)
        .values({ 
          comic_book_id: comicBookId,
          comic_book_cover_id: comicBookCoverId, 
          file_path: filePath
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

export const getThumbnailsByComicBookId = async (comicBookId: number): Promise<ComicBookThumbnail[] | null> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    // Updated query to handle both generated and custom thumbnails
    const result = await db
      .select()
      .from(comicBookThumbnails)
      .where(
        // Get thumbnails directly linked to the comic book OR through covers/pages
        eq(comicBookThumbnails.comic_book_id, comicBookId)
      );

    return result;
  } catch (error) {
    console.error("Error fetching thumbnails by comic book ID:", error);
    throw error;
  }
};

export const getComicThumbnailById = async (thumbnailId: number): Promise<ComicBookThumbnail | null> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
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
  description?: string
): Promise<number> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .insert(comicBookThumbnails)
      .values({ 
        comic_book_id: comicBookId,
        comic_book_cover_id: null, // Custom thumbnails aren't linked to covers
        file_path: filePath,
        thumbnail_type: "custom",
        name: name,
        description: description,
        uploaded_by: uploadedBy
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

export const deleteComicBookThumbnail = async (thumbnailId: number): Promise<void> => {
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