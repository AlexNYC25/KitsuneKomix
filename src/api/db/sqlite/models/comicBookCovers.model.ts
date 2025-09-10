import { getClient } from "../client.ts";
import { comicBookCovers } from "../schema.ts";
import { eq } from "drizzle-orm";

export const insertComicBookCover = async (
  comicBookId: number,
  filePath: string,
): Promise<number> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .insert(comicBookCovers)
      .values({
        comic_book_id: comicBookId,
        file_path: filePath,
      })
      .returning({ id: comicBookCovers.id });

    return result[0].id;
  } catch (error) {
    console.error("Error inserting comic book cover:", error);
    throw error;
  }
};
