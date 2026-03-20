import { eq, ilike } from "drizzle-orm";

import { getClient } from "../client.ts";

import { comicBookCharactersTable, comicCharactersTable } from "../schema.ts";
import type { ComicCharacter } from "#types/index.ts";

/**
 * Inserts a new comic character into the database or returns the ID of an existing character with the same name
 * @param name The name of the character to insert
 * @returns The ID of the newly inserted character or the ID of the existing character with the same name
 */
export const insertComicCharacter = async (name: string): Promise<number> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { id: number }[] = await db
      .insert(comicCharactersTable)
      .values({ name })
      .onConflictDoNothing()
      .returning({ id: comicCharactersTable.id });

    // If result is empty, it means the character already exists due to onConflictDoNothing
    if (result.length === 0) {
      // Find the existing character by name (which should be unique)
      const existingCharacter: { id: number }[] = await db
        .select({ id: comicCharactersTable.id })
        .from(comicCharactersTable)
        .where(eq(comicCharactersTable.name, name));

      if (existingCharacter.length > 0) {
        console.log(
          `Comic character already exists with name: ${name}, returning existing ID: ${
            existingCharacter[0].id
          }`,
        );
        return existingCharacter[0].id;
      }

      throw new Error(
        `Failed to insert comic character and could not find existing character. Name: ${name}`,
      );
    }

    return result[0].id;
  } catch (error) {
    console.error(`Error inserting comic character`, error);
    throw error;
  }
};

/**
 * Creates a link between a character and a comic book in the database
 * @param characterId The ID of the character to link
 * @param comicBookId The ID of the comic book to link
 * @returns A promise that resolves when the link has been created
 */
export const linkCharacterToComicBook = async (
  characterId: number,
  comicBookId: number,
): Promise<void> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    await db
      .insert(comicBookCharactersTable)
      .values({ comicCharacterId: characterId, comicBookId: comicBookId })
      .onConflictDoNothing(); // Avoid duplicate links
  } catch (error) {
    console.error("Error linking character to comic book:", error);
    throw error;
  }
};

/**
 * Unlinks all characters from a comic book by removing all relationships in the junction table
 * @param comicBookId The ID of the comic book
 * @returns void
 */
export const unlinkCharactersToComicBook = async (
  comicBookId: number,
): Promise<void> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    await db
      .delete(comicBookCharactersTable)
      .where(eq(comicBookCharactersTable.comicBookId, comicBookId));
  } catch (error) {
    console.error("Error unlinking characters from comic book:", error);
    throw error;
  }
};

/**
 * Retrieves all characters associated with a specific comic book
 * @param comicBookId The ID of the comic book
 * @returns An array of ComicCharacter objects associated with the comic book
 */
export const getCharactersByComicBookId = async (
  comicBookId: number,
): Promise<ComicCharacter[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { comicCharacter: ComicCharacter }[] = await db
      .select({
        comicCharacter: comicCharactersTable,
      })
      .from(comicCharactersTable)
      .innerJoin(
        comicBookCharactersTable,
        eq(
          comicCharactersTable.id,
          comicBookCharactersTable.comicCharacterId,
        ),
      )
      .where(eq(comicBookCharactersTable.comicBookId, comicBookId));

    return result.map((row) => row.comicCharacter);
  } catch (error) {
    console.error("Error fetching characters by comic book ID:", error);
    throw error;
  }
};

/**
 * Searches for character IDs matching a filter string
 * @param filter The search filter string to match against character names (case-insensitive substring match)
 * @returns An array of character IDs that match the filter, or an empty array if no matches found
 */
export const getCharactersIdsByFilter = async (
  filter: string,
): Promise<number[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    // Step 1: Find character IDs matching the filter
    const matchingCharacters: { id: number }[] = await db
      .select({ id: comicCharactersTable.id })
      .from(comicCharactersTable)
      .where(ilike(comicCharactersTable.name, `%${filter}%`));

    if (matchingCharacters.length === 0) {
      return [];
    }

    const characterIds: number[] = matchingCharacters.map((char) => char.id);

    return characterIds;
  } catch (error) {
    console.error("Error fetching character IDs by filter:", error);
    throw error;
  }
};
