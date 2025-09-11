import { getClient } from "../client.ts";
import { comicBookThumbnails} from "../schema.ts";

import { eq } from "drizzle-orm";
import type { ComicBookThumbnail } from "../../../types/index.ts";

export const insertComicBookThumbnail = async (comicBookId: number, filePath: string): Promise<number> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .insert(comicBookThumbnails)
      .values({ comic_book_id: comicBookId, file_path: filePath })
      .returning({ id: comicBookThumbnails.id });

    if (result.length === 0) {
      throw new Error(
        `Failed to insert thumbnail for comic book ID ${comicBookId}`,
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
      .select()
      .from(comicBookThumbnails)
      .where(eq(comicBookThumbnails.comic_book_id, comicBookId));

    return result;
  } catch (error) {
    console.error("Error fetching thumbnails by comic book ID:", error);
    throw error;
  }
};