import { eq, ilike } from "drizzle-orm";

import { getClient } from "../client.ts";
import { comicBookPencillersTable, comicPencillersTable } from "../schema.ts";
import type { ComicPenciller } from "../../../types/index.ts";

export const insertComicPenciller = async (
  name: string,
  description?: string,
): Promise<number> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .insert(comicPencillersTable)
      .values({ name, description: description ?? null })
      .onConflictDoNothing()
      .returning({ id: comicPencillersTable.id });

    // If result is empty, it means the penciller already exists due to onConflictDoNothing
    if (result.length === 0) {
      // Find the existing penciller by name (which should be unique)
      const existingPenciller = await db
        .select({ id: comicPencillersTable.id })
        .from(comicPencillersTable)
        .where(eq(comicPencillersTable.name, name));

      if (existingPenciller.length > 0) {
        console.log(
          `Comic penciller already exists with name: ${name}, returning existing ID: ${
            existingPenciller[0].id
          }`,
        );
        return existingPenciller[0].id;
      }

      throw new Error(
        `Failed to insert comic penciller and could not find existing penciller. Name: ${name}`,
      );
    }

    return result[0].id;
  } catch (error) {
    console.error("Error inserting comic penciller:", error);
    throw error;
  }
};

export const linkPencillerToComicBook = async (
  pencillerId: number,
  comicBookId: number,
): Promise<void> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    await db
      .insert(comicBookPencillersTable)
      .values({ comic_penciller_id: pencillerId, comic_book_id: comicBookId })
      .onConflictDoNothing(); // Avoid duplicate links
  } catch (error) {
    console.error("Error linking penciller to comic book:", error);
    throw error;
  }
};

export const getPencillersByComicBookId = async (
  comicBookId: number,
): Promise<ComicPenciller[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .select({
        comic_penciller: comicPencillersTable,
      })
      .from(comicPencillersTable)
      .innerJoin(
        comicBookPencillersTable,
        eq(
          comicPencillersTable.id,
          comicBookPencillersTable.comic_penciller_id,
        ),
      )
      .where(eq(comicBookPencillersTable.comic_book_id, comicBookId));

    return result.map(({ comic_penciller }) => comic_penciller);
  } catch (error) {
    console.error("Error fetching pencillers by comic book ID:", error);
    throw error;
  }
};

export const getPencillerIdsByFilter = async (
  filter: string,
): Promise<number[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .select({ id: comicPencillersTable.id })
      .from(comicPencillersTable)
      .where(ilike(comicPencillersTable.name, `%${filter}%`));

    return result.map((row) => row.id);
  } catch (error) {
    console.error("Error fetching penciller IDs by filter:", error);
    throw error;
  }
};
