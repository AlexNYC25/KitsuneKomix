import { eq } from "drizzle-orm";

import { getClient } from "../client.ts";
import { comicPagesTable } from "../schema.ts";

import type { ComicPage } from "#types/index.ts";

/**
 * Inserts a new comic page into the database
 * @param comicBookId The ID of the comic book this page belongs to
 * @param filePath The file path of the page image
 * @param pageNumber The page number within the comic book
 * @param hash The hash of the page file for deduplication
 * @param fileSize The size of the page file in bytes
 * @param type The type of page (e.g., "Story", "Cover"), defaults to "Story"
 * @param doublePage Whether this is a double page spread, defaults to 0
 * @param width Optional width of the page in pixels
 * @param length Optional height of the page in pixels
 * @returns The ID of the newly inserted comic page
 *
 * TODO: Update the parameters to be an object for better declaration
 */
export const insertComicPage = async (
  comicBookId: number,
  filePath: string,
  pageNumber: number,
  hash: string,
  fileSize: number,
  type: string = "Story",
  doublePage: number = 0,
  width?: number | null,
  length?: number | null,
): Promise<number> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const values = {
      comicBookId: comicBookId,
      filePath: filePath,
      pageNumber: pageNumber,
      hash: hash,
      fileSize: fileSize,
      type: type,
      doublePage: doublePage,
      ...(width !== undefined && { width }),
      ...(length !== undefined && { length }),
    };

    const result: { id: number }[] = await db
      .insert(comicPagesTable)
      .values(values)
      .returning({ id: comicPagesTable.id });

    return result[0].id;
  } catch (error) {
    console.error("Error inserting comic page:", error);
    throw error;
  }
};

/**
 * Retrieves all comic pages for a specific comic book, ordered by page number
 * @param comicBookId The ID of the comic book
 * @returns An array of ComicPage objects belonging to the comic book, ordered by page number
 */
export const getComicPagesByComicBookId = async (
  comicBookId: number,
): Promise<ComicPage[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: ComicPage[] = await db
      .select()
      .from(comicPagesTable)
      .where(
        eq(comicPagesTable.comicBookId, comicBookId),
      ).orderBy(comicPagesTable.pageNumber);

    return result;
  } catch (error) {
    console.error("Error fetching comic pages by comic book ID:", error);
    throw error;
  }
};
