import { eq, ilike } from "drizzle-orm";

import { getClient } from "../client.ts";

import { comicBookImprintsTable, comicImprintsTable } from "../schema.ts";
import type { ComicImprint } from "../../../types/index.ts";

export const insertComicImprint = async (name: string): Promise<number> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .insert(comicImprintsTable)
      .values({ name })
      .onConflictDoNothing()
      .returning({ id: comicImprintsTable.id });

    // If result is empty, it means the imprint already exists due to onConflictDoNothing
    if (result.length === 0) {
      // Find the existing imprint by name (which should be unique)
      const existingImprint = await db
        .select({ id: comicImprintsTable.id })
        .from(comicImprintsTable)
        .where(eq(comicImprintsTable.name, name));

      if (existingImprint.length > 0) {
        console.log(
          `Comic imprint already exists with name: ${name}, returning existing ID: ${
            existingImprint[0].id
          }`,
        );
        return existingImprint[0].id;
      }

      throw new Error(
        `Failed to insert comic imprint and could not find existing imprint. Name: ${name}`,
      );
    }

    return result[0].id;
  } catch (error) {
    console.error("Error inserting comic imprint:", error);
    throw error;
  }
};

export const linkImprintToComicBook = async (
  imprintId: number,
  comicBookId: number,
): Promise<void> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    await db
      .insert(comicBookImprintsTable)
      .values({ comic_imprint_id: imprintId, comic_book_id: comicBookId })
      .onConflictDoNothing(); // Avoid duplicate links
  } catch (error) {
    console.error("Error linking imprint to comic book:", error);
    throw error;
  }
};

export const getImprintsByComicBookId = async (
  comicBookId: number,
): Promise<ComicImprint[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .select({
        comic_imprint: comicImprintsTable,
      })
      .from(comicImprintsTable)
      .innerJoin(
        comicBookImprintsTable,
        eq(comicImprintsTable.id, comicBookImprintsTable.comic_imprint_id),
      )
      .where(eq(comicBookImprintsTable.comic_book_id, comicBookId));

    return result.map((row) => row.comic_imprint);
  } catch (error) {
    console.error("Error fetching imprints by comic book ID:", error);
    throw error;
  }
};

export const getImprintIdsByFilter = async (
  filter: string,
): Promise<number[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .select({ id: comicImprintsTable.id })
      .from(comicImprintsTable)
      .where(ilike(comicImprintsTable.name, `%${filter}%`));

    return result.map((row) => row.id);
  } catch (error) {
    console.error("Error fetching comic imprint IDs by filter:", error);
    throw error;
  }
};
