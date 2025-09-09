import { getClient } from "../client.ts";
import { comicPagesTable } from "../schema.ts";
import { eq } from "drizzle-orm";

export const insertComicPage = async (comicBookId: number, filePath: string, pageNumber: number, hash: string): Promise<number> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .insert(comicPagesTable)
      .values({
        comic_book_id: comicBookId,
        file_path: filePath,
        page_number: pageNumber,
        hash: hash,
      })
      .returning({ id: comicPagesTable.id });

    return result[0].id;
  } catch (error) {
    console.error("Error inserting comic page:", error);
    throw error;
  }
};