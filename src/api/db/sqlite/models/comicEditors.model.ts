import { eq, ilike } from "drizzle-orm";

import { getClient } from "../client.ts";

import { ComicEditor } from "../../../types/index.ts";
import { comicBookEditorsTable, comicEditorsTable } from "../schema.ts";

export const insertComicEditor = async (name: string): Promise<number> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .insert(comicEditorsTable)
      .values({ name })
      .onConflictDoNothing()
      .returning({ id: comicEditorsTable.id });

    // If result is empty, it means the editor already exists due to onConflictDoNothing
    if (result.length === 0) {
      // Find the existing editor by name (which should be unique)
      const existingEditor = await db
        .select({ id: comicEditorsTable.id })
        .from(comicEditorsTable)
        .where(eq(comicEditorsTable.name, name));

      if (existingEditor.length > 0) {
        console.log(
          `Comic editor already exists with name: ${name}, returning existing ID: ${
            existingEditor[0].id
          }`,
        );
        return existingEditor[0].id;
      }

      throw new Error(
        `Failed to insert comic editor and could not find existing editor. Name: ${name}`,
      );
    }

    return result[0].id;
  } catch (error) {
    console.error("Error inserting comic editor:", error);
    throw error;
  }
};

export const linkEditorToComicBook = async (
  editorId: number,
  comicBookId: number,
): Promise<void> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    await db
      .insert(comicBookEditorsTable)
      .values({ comic_editor_id: editorId, comic_book_id: comicBookId })
      .onConflictDoNothing(); // Avoid duplicate links
  } catch (error) {
    console.error("Error linking editor to comic book:", error);
    throw error;
  }
};

export const getEditorsByComicBookId = async (
  comicBookId: number,
): Promise<ComicEditor[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .select({
        comic_editor: comicEditorsTable,
      })
      .from(comicEditorsTable)
      .innerJoin(
        comicBookEditorsTable,
        eq(comicEditorsTable.id, comicBookEditorsTable.comic_editor_id),
      )
      .where(eq(comicBookEditorsTable.comic_book_id, comicBookId));

    return result.map((row) => row.comic_editor);
  } catch (error) {
    console.error("Error fetching editors by comic book ID:", error);
    throw error;
  }
};

export const getComicEditorIdsByFilter = async (
  filter: string,
): Promise<number[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .select({ id: comicEditorsTable.id })
      .from(comicEditorsTable)
      .where(ilike(comicEditorsTable.name, `%${filter}%`));

    return result.map((row) => row.id);
  } catch (error) {
    console.error("Error fetching comic editor IDs by filter:", error);
    throw error;
  }
};
