import { eq } from "drizzle-orm";

import { getClient } from "../client.ts";
import { ComicInker } from "../../../types/index.ts";
import { comicBookInkersTable, comicInkersTable } from "../schema.ts";

export const insertComicInker = async (name: string): Promise<number> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .insert(comicInkersTable)
      .values({ name })
      .onConflictDoNothing()
      .returning({ id: comicInkersTable.id });

    // If result is empty, it means the inker already exists due to onConflictDoNothing
    if (result.length === 0) {
      // Find the existing inker by name (which should be unique)
      const existingInker = await db
        .select({ id: comicInkersTable.id })
        .from(comicInkersTable)
        .where(eq(comicInkersTable.name, name));

      if (existingInker.length > 0) {
        console.log(
          `Comic inker already exists with name: ${name}, returning existing ID: ${
            existingInker[0].id
          }`,
        );
        return existingInker[0].id;
      }

      throw new Error(
        `Failed to insert comic inker and could not find existing inker. Name: ${name}`,
      );
    }

    return result[0].id;
  } catch (error) {
    console.error("Error inserting comic inker:", error);
    throw error;
  }
};

export const linkInkerToComicBook = async (
  inkerId: number,
  comicBookId: number,
): Promise<void> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    await db
      .insert(comicBookInkersTable)
      .values({ comic_inker_id: inkerId, comic_book_id: comicBookId })
      .onConflictDoNothing(); // Avoid duplicate links
  } catch (error) {
    console.error("Error linking inker to comic book:", error);
    throw error;
  }
};

export const getInkersByComicBookId = async (
  comicBookId: number,
): Promise<ComicInker[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .select({
        comic_inker: comicInkersTable,
      })
      .from(comicInkersTable)
      .innerJoin(
        comicBookInkersTable,
        eq(comicInkersTable.id, comicBookInkersTable.comic_inker_id),
      )
      .where(eq(comicBookInkersTable.comic_book_id, comicBookId));

    return result.map(({ comic_inker }) => comic_inker);
  } catch (error) {
    console.error("Error fetching inkers by comic book ID:", error);
    throw error;
  }
};