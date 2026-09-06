import { eq } from "drizzle-orm";

import { getClient } from "../drizzle/client.ts";
import { dbLogger } from "../loggers/index.ts";

import {
  comicBookContentsTable,
  comicContentTable,
} from "../schemas/index.ts";

/**
 * Inserts a piece of comic content (e.g. a character, team or location) into
 * the database, returning its ID. If the content already exists (name is
 * unique), the existing content's ID is returned.
 * @param name The name of the content, e.g. a character or team name
 * @param type The type of content, e.g. "character", "team" or "location"
 * @returns The ID of the content
 */
export const insertContent = async (
  name: string,
  type: string,
): Promise<number> => {
  const db = await getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  try {
    const insertResult: { id: number }[] = await db
      .insert(comicContentTable)
      .values({ name, type })
      .onConflictDoNothing()
      .returning({ id: comicContentTable.id });

    if (insertResult[0]) {
      return insertResult[0].id;
    }

    const existingContent = await db
      .select({ id: comicContentTable.id })
      .from(comicContentTable)
      .where(eq(comicContentTable.name, name))
      .limit(1);

    if (!existingContent[0]) {
      throw new Error("Content already exists but could not be fetched.");
    }

    return existingContent[0].id;
  } catch (error) {
    dbLogger.error("Error inserting content:" + error);
    throw error;
  }
};

/**
 * Associates a piece of content with a comic book by creating a mapping record.
 * @param contentId The ID of the content
 * @param comicBookId The ID of the comic book
 * @returns A boolean indicating whether a new mapping was created
 */
export const linkContentToComicBook = async (
  contentId: number,
  comicBookId: number,
): Promise<boolean> => {
  const db = await getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { id: number }[] = await db
      .insert(comicBookContentsTable)
      .values({
        comicBookId,
        comicContentId: contentId,
      })
      .onConflictDoNothing()
      .returning({ id: comicBookContentsTable.id });

    return result.length > 0;
  } catch (error) {
    dbLogger.error("Error linking content to comic book:" + error);
    throw error;
  }
};