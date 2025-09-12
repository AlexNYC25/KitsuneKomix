import { eq } from "drizzle-orm";

import { getClient } from "../client.ts";

import { comicBookCharactersTable, comicCharactersTable } from "../schema.ts";
import type { ComicCharacter } from "../../../types/index.ts";

export const insertComicCharacter = async (name: string): Promise<number> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .insert(comicCharactersTable)
      .values({ name })
      .onConflictDoNothing()
      .returning({ id: comicCharactersTable.id });

    // If result is empty, it means the character already exists due to onConflictDoNothing
    if (result.length === 0) {
      // Find the existing character by name (which should be unique)
      const existingCharacter = await db
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
      .values({ comic_character_id: characterId, comic_book_id: comicBookId })
      .onConflictDoNothing(); // Avoid duplicate links
  } catch (error) {
    console.error("Error linking character to comic book:", error);
    throw error;
  }
};

export const getCharactersByComicBookId = async (
  comicBookId: number,
): Promise<ComicCharacter[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .select({
        comic_character: comicCharactersTable,
      })
      .from(comicCharactersTable)
      .innerJoin(
        comicBookCharactersTable,
        eq(
          comicCharactersTable.id,
          comicBookCharactersTable.comic_character_id,
        ),
      )
      .where(eq(comicBookCharactersTable.comic_book_id, comicBookId));

    return result.map((row) => row.comic_character);
  } catch (error) {
    console.error("Error fetching characters by comic book ID:", error);
    throw error;
  }
};
