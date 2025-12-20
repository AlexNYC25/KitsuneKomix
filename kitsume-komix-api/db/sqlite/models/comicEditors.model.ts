import { eq, ilike } from "drizzle-orm";

import { getClient } from "../client.ts";

import { ComicEditor } from "#types/index.ts";
import { comicBookEditorsTable, comicEditorsTable } from "../schema.ts";

/**
 * Inserts a new comic editor into the database or returns the ID of an existing editor with the same name
 * @param name The name of the editor to insert
 * @returns The ID of the newly inserted editor or the ID of the existing editor with the same name
 */
export const insertComicEditor = async (name: string): Promise<number> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { id: number }[] = await db
      .insert(comicEditorsTable)
      .values({ name })
      .onConflictDoNothing()
      .returning({ id: comicEditorsTable.id });

    // If result is empty, it means the editor already exists due to onConflictDoNothing
    if (result.length === 0) {
      // Find the existing editor by name (which should be unique)
      const existingEditor: { id: number }[] = await db
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

/**
 * Creates a link between an editor and a comic book in the database
 * @param editorId The ID of the editor to link
 * @param comicBookId The ID of the comic book to link
 * @returns A promise that resolves when the link has been created
 */
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
      .values({ comicEditorId: editorId, comicBookId: comicBookId })
      .onConflictDoNothing(); // Avoid duplicate links
  } catch (error) {
    console.error("Error linking editor to comic book:", error);
    throw error;
  }
};

/**
 * Retrieves all editors associated with a specific comic book
 * @param comicBookId The ID of the comic book
 * @returns An array of ComicEditor objects associated with the comic book
 */
export const getEditorsByComicBookId = async (
  comicBookId: number,
): Promise<ComicEditor[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { comicEditor: ComicEditor }[] = await db
      .select({
        comicEditor: comicEditorsTable,
      })
      .from(comicEditorsTable)
      .innerJoin(
        comicBookEditorsTable,
        eq(comicEditorsTable.id, comicBookEditorsTable.comicEditorId),
      )
      .where(eq(comicBookEditorsTable.comicBookId, comicBookId));

    return result.map((row) => row.comicEditor);
  } catch (error) {
    console.error("Error fetching editors by comic book ID:", error);
    throw error;
  }
};

/**
 * Searches for editor IDs matching a filter string
 * @param filter The search filter string to match against editor names (case-insensitive substring match)
 * @returns An array of editor IDs that match the filter, or an empty array if no matches found
 */
export const getEditorIdsByFilter = async (
  filter: string,
): Promise<number[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { id: number }[] = await db
      .select({ id: comicEditorsTable.id })
      .from(comicEditorsTable)
      .where(ilike(comicEditorsTable.name, `%${filter}%`));

    return result.map((row) => row.id);
  } catch (error) {
    console.error("Error fetching comic editor IDs by filter:", error);
    throw error;
  }
};
