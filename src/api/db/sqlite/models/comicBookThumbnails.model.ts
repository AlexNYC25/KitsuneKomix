import { getClient } from "../client.ts";
import { comicBookCovers, comicBookThumbnails, comicPagesTable} from "../schema.ts";

import { eq, and } from "drizzle-orm";
import type { ComicBookThumbnail } from "../../../types/index.ts";

export const insertComicBookThumbnail = async (comicBookCoverId: number, filePath: string): Promise<number> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .insert(comicBookThumbnails)
      .values({ comic_book_cover_id: comicBookCoverId, file_path: filePath })
      .returning({ id: comicBookThumbnails.id });

    if (result.length === 0) {
      throw new Error(
        `Failed to insert thumbnail for comic book cover ID ${comicBookCoverId}`,
      );
    }

    return result[0].id;
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
    const result = await db
      .select(
        {
          comic_book_thumbnails: comicBookThumbnails
        }
      )
      .from(comicBookThumbnails)
      .leftJoin(
        comicBookCovers,
        eq(comicBookThumbnails.comic_book_cover_id, comicBookCovers.id)
      )
      .leftJoin(
        comicPagesTable,
        eq(comicBookCovers.comic_page_id, comicPagesTable.id)
      )
      .where(eq(comicPagesTable.comic_book_id, comicBookId));

    return result.map((row) => row.comic_book_thumbnails);
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
      .select(
        {
          comic_book_thumbnails: comicBookThumbnails
        }
      )
      .from(comicBookThumbnails)
      .where(
        eq(comicBookThumbnails.id, thumbnailId)
      );

    return result.length > 0 ? result[0].comic_book_thumbnails : null;
  } catch (error) {
    console.error("Error fetching comic book thumbnail by ID:", error);
    throw error;
  }
};
