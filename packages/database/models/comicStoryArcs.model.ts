import { eq } from "drizzle-orm";

import { getClient } from "../drizzle/client.ts";
import { dbLogger } from "../loggers/index.ts";

import {
  comicBookStoryArcsTable,
  comicStoryArcsTable,
} from "../schemas/index.ts";

/**
 * Inserts a story arc into the database, returning its ID. If the story arc
 * already exists (name is unique), the existing story arc's ID is returned.
 * @param name The name of the story arc to insert
 * @returns The ID of the story arc
 */
export const insertStoryArc = async (name: string): Promise<number> => {
  const db = await getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  try {
    const insertResult: { id: number }[] = await db
      .insert(comicStoryArcsTable)
      .values({ name })
      .onConflictDoNothing()
      .returning({ id: comicStoryArcsTable.id });

    if (insertResult[0]) {
      return insertResult[0].id;
    }

    const existingStoryArc = await db
      .select({ id: comicStoryArcsTable.id })
      .from(comicStoryArcsTable)
      .where(eq(comicStoryArcsTable.name, name))
      .limit(1);

    if (!existingStoryArc[0]) {
      throw new Error("Story arc already exists but could not be fetched.");
    }

    return existingStoryArc[0].id;
  } catch (error) {
    dbLogger.error("Error inserting story arc:" + error);
    throw error;
  }
};

/**
 * Associates a story arc with a comic book by creating a mapping record. The
 * position indicates the order of the story arc relative to the comic book.
 * @param storyArcId The ID of the story arc
 * @param comicBookId The ID of the comic book
 * @param position The zero-based order of the story arc in the comic book
 * @returns A boolean indicating whether a new mapping was created
 */
export const linkStoryArcToComicBook = async (
  storyArcId: number,
  comicBookId: number,
  position: number,
): Promise<boolean> => {
  const db = await getClient();

  if (!db) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { id: number }[] = await db
      .insert(comicBookStoryArcsTable)
      .values({
        comicBookId,
        comicStoryArcId: storyArcId,
        position,
      })
      .onConflictDoNothing()
      .returning({ id: comicBookStoryArcsTable.id });

    return result.length > 0;
  } catch (error) {
    dbLogger.error("Error linking story arc to comic book:" + error);
    throw error;
  }
};