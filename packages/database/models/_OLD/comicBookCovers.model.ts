import { getClient } from "../../drizzle/client.ts";

import { comicBookCoversTable} from "../../schemas/index.ts";

import { dbLogger } from "../../loggers/index.ts";

import type { DrizzleType } from "../../shared/types/index.ts";

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
  const db: DrizzleType = await getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: {id: number}[] = await db
      .insert(comicBookCoversTable)
      .values({
        comicPageId: comicPageId,
        filePath: filePath,
      })
      .returning({ id: comicBookCoversTable.id });

    if (result.length === 0) {
      throw new Error("Failed to insert comic book cover.");
    }

    if (result.length > 1) {
      dbLogger.warn(
        `Multiple records returned when inserting comic book cover for page ID ${comicPageId}.`,
      );
    }

    if (!result[0]) {
      throw new Error("No record returned when inserting comic book cover.");
    }

    return result[0].id;
  } catch (error) {
    dbLogger.error("Error inserting comic book cover:" + error);
    throw error;
  }
};
