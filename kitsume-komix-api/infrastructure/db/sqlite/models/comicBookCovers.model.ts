import { getClient } from "../client.ts";
import { comicBookCovers } from "../schema.ts";

/**
 * Insertion function for a new comic book cover record
 * @param comicPageId Id of the page within the comic page table
 * @param filePath The internal path to the image from within the comic archive
 * @returns The id of the new record
 */
export const insertComicBookCover = async (
  comicPageId: number,
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
        comicPageId: comicPageId,
        filePath: filePath,
      })
      .returning({ id: comicBookCovers.id });

    return result[0].id;
  } catch (error) {
    console.error("Error inserting comic book cover:", error);
    throw error;
  }
};
