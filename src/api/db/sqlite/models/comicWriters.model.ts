import { eq, ilike } from "drizzle-orm";

import { getClient } from "../client.ts";
import { comicBookWritersTable, comicWritersTable } from "../schema.ts";
import type { ComicWriter } from "../../../types/index.ts";

export const insertComicWriter = async (name: string): Promise<number> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .insert(comicWritersTable)
      .values({ name })
      .onConflictDoNothing()
      .returning({ id: comicWritersTable.id });

    // If result is empty, it means the writer already exists due to onConflictDoNothing
    if (result.length === 0) {
      // Find the existing writer by name (which should be unique)
      const existingWriter = await db
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
      .values({ comic_writer_id: writerId, comic_book_id: comicBookId })
      .onConflictDoNothing(); // Avoid duplicate links
  } catch (error) {
    console.error("Error linking writer to comic book:", error);
    throw error;
  }
};

export const getWritersByComicBookId = async (
  comicBookId: number,
): Promise<ComicWriter[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .select(
        { comicWriter: comicWritersTable },
      )
      .from(comicWritersTable)
      .innerJoin(
        comicBookWritersTable,
        eq(comicWritersTable.id, comicBookWritersTable.comic_writer_id),
      )
      .where(eq(comicBookWritersTable.comic_book_id, comicBookId));

    return result.map(({ comicWriter }) => comicWriter);
  } catch (error) {
    console.error("Error fetching writers by comic book ID:", error);
    throw error;
  }
};

export const getComicWriterIdsByFilter = async (
  filter: string,
): Promise<number[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .select({ id: comicWritersTable.id })
      .from(comicWritersTable)
      .where(ilike(comicWritersTable.name, `%${filter}%`));

    return result.map((row) => row.id);
  } catch (error) {
    console.error("Error fetching writer IDs by filter:", error);
    throw error;
  }
};