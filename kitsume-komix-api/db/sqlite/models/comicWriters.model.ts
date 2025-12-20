import { eq, ilike } from "drizzle-orm";

import { getClient } from "../client.ts";
import { comicBookWritersTable, comicWritersTable } from "../schema.ts";

import type { ComicWriter } from "#types/index.ts";

/**
 * Inserts a new comic writer into the database
 * @param name The name of the writer
 * @returns The ID of the newly inserted or existing writer
 */
export const insertComicWriter = async (name: string): Promise<number> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { id: number }[] = await db
      .insert(comicWritersTable)
      .values({ name })
      .onConflictDoNothing()
      .returning({ id: comicWritersTable.id });

    // If result is empty, it means the writer already exists due to onConflictDoNothing
    if (result.length === 0) {
      // Find the existing writer by name (which should be unique)
      const existingWriter: { id: number }[] = await db
        .select({ id: comicWritersTable.id })
        .from(comicWritersTable)
        .where(eq(comicWritersTable.name, name));

      if (existingWriter.length > 0) {
        console.log(
          `Comic writer already exists with name: ${name}, returning existing ID: ${
            existingWriter[0].id
          }`,
        );
        return existingWriter[0].id;
      }

      throw new Error(
        `Failed to insert comic writer and could not find existing writer. Name: ${name}`,
      );
    }

    return result[0].id;
  } catch (error) {
    console.error("Error inserting comic writer:", error);
    throw error;
  }
};

/**
 * Links a writer to a comic book by creating a relationship in the junction table
 * @param writerId The ID of the writer
 * @param comicBookId The ID of the comic book
 * @returns void
 */
export const linkWriterToComicBook = async (
  writerId: number,
  comicBookId: number,
): Promise<void> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    await db
      .insert(comicBookWritersTable)
      .values({ comicWriterId: writerId, comicBookId: comicBookId })
      .onConflictDoNothing(); // Avoid duplicate links
  } catch (error) {
    console.error("Error linking writer to comic book:", error);
    throw error;
  }
};

/**
 * Retrieves all writers for a specific comic book
 * @param comicBookId The ID of the comic book
 * @returns An array of ComicWriter objects associated with the comic book
 */
export const getWritersByComicBookId = async (
  comicBookId: number,
): Promise<ComicWriter[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { comicWriter: ComicWriter }[] = await db
      .select(
        { comicWriter: comicWritersTable },
      )
      .from(comicWritersTable)
      .innerJoin(
        comicBookWritersTable,
        eq(comicWritersTable.id, comicBookWritersTable.comicWriterId),
      )
      .where(eq(comicBookWritersTable.comicBookId, comicBookId));

    return result.map(({ comicWriter }) => comicWriter);
  } catch (error) {
    console.error("Error fetching writers by comic book ID:", error);
    throw error;
  }
};

/**
 * Searches for writer IDs by name filter
 * @param filter The partial name to search for (case-insensitive)
 * @returns An array of writer IDs matching the filter
 */
export const getWriterIdsByFilter = async (
  filter: string,
): Promise<number[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { id: number }[] = await db
      .select({ id: comicWritersTable.id })
      .from(comicWritersTable)
      .where(ilike(comicWritersTable.name, `%${filter}%`));

    return result.map((row) => row.id);
  } catch (error) {
    console.error("Error fetching writer IDs by filter:", error);
    throw error;
  }
};
