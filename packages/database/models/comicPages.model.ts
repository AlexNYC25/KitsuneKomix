import { eq } from "drizzle-orm";

import { getClient } from "../drizzle/client.ts";
import { dbLogger } from "../loggers/index.ts";

import { comicPagesTable } from "../schemas/index.ts";
import type { NewComicPage } from "../shared/types/database.types.ts";

/**
 * Inserts a comic page into the database, returning its ID.
 * @param page The page data to insert
 * @returns The ID of the inserted page
 */
export const insertComicPage = async (page: NewComicPage): Promise<number> => {
  const db = await getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .insert(comicPagesTable)
      .values(page)
      .returning({ id: comicPagesTable.id });

    if (result[0]) {
      return result[0].id;
    }

    throw new Error("Insert did not return an ID.");
  } catch (error) {
    dbLogger.error("Error inserting comic page:" + error);
    throw error;
  }
};

/**
 * Deletes all comic pages associated with a given comic book.
 * @param comicBookId The ID of the comic book whose pages to delete
 * @returns The number of deleted rows
 */
export const deleteComicPagesForBook = async (comicBookId: number): Promise<number> => {
  const db = await getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .delete(comicPagesTable)
      .where(eq(comicPagesTable.comicBookId, comicBookId))
      .returning({ id: comicPagesTable.id });

    return result.length;
  } catch (error) {
    dbLogger.error("Error deleting comic pages for book:" + error);
    throw error;
  }
};
