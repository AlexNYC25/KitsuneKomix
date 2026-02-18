import { eq } from "drizzle-orm";

import { getClient } from "../client.ts";
import {
  comicBookCharactersTable,
  comicBookColoristsTable,
  comicBookCoverArtistsTable,
  comicBookEditorsTable,
  comicBookGenresTable,
  comicBookImprintsTable,
  comicBookInkersTable,
  comicBookLetterersTable,
  comicBookLocationsTable,
  comicBookPencillersTable,
  comicBookPublishersTable,
  comicBookSeriesGroupsTable,
  comicBookStoryArcsTable,
  comicBookTeamsTable,
  comicBookWritersTable,
} from "../schema.ts";

import type {
  NewComicBookCharacter,
  NewComicBookGenre,
  NewComicBookPenciller,
  NewComicBookPublisher,
  NewComicBookWriter,
} from "#types/index.ts";

// Writers

/**
 * Add a writer relation to a comic book.
 * @param relation NewComicBookWriter The writer relation to add.
 * @returns Promise<number> The ID of the newly added writer relation.
 */
export const addComicBookWriter = async (
  relation: NewComicBookWriter,
): Promise<number> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .insert(comicBookWritersTable)
      .values(relation)
      .onConflictDoNothing()
      .returning({ id: comicBookWritersTable.id });

    return result.length > 0 ? result[0].id : 0;
  } catch (error) {
    console.error("Error adding comic book writer relation:", error);
    throw error;
  }
};

/**
 * Remove a writer relation from a comic book.
 * @param comicBookId number The ID of the comic book.
 * @param writerId number The ID of the writer to remove.
 * @returns Promise<boolean> True if the relation was removed, false otherwise.
 */
export const removeComicBookWriter = async (
  comicBookId: number,
  writerId: number,
): Promise<boolean> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .delete(comicBookWritersTable)
      .where(
        eq(comicBookWritersTable.comicBookId, comicBookId) &&
          eq(comicBookWritersTable.comicWriterId, writerId),
      )
      .returning({ id: comicBookWritersTable.id });

    return result.length > 0;
  } catch (error) {
    console.error("Error removing comic book writer relation:", error);
    throw error;
  }
};

// Pencillers

/**
 * Add a penciller relation to a comic book.
 * @param relation NewComicBookPenciller The penciller relation to add.
 * @returns Promise<number> The ID of the newly added penciller relation.
 */
export const addComicBookPenciller = async (
  relation: NewComicBookPenciller,
): Promise<number> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .insert(comicBookPencillersTable)
      .values(relation)
      .onConflictDoNothing()
      .returning({ id: comicBookPencillersTable.id });

    return result.length > 0 ? result[0].id : 0;
  } catch (error) {
    console.error("Error adding comic book penciller relation:", error);
    throw error;
  }
};

// Characters

/**
 * Add a character relation to a comic book.
 * @param relation NewComicBookCharacter The character relation to add.
 * @returns Promise<number> The ID of the newly added character relation.
 */
export const addComicBookCharacter = async (
  relation: NewComicBookCharacter,
): Promise<number> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .insert(comicBookCharactersTable)
      .values(relation)
      .onConflictDoNothing()
      .returning({ id: comicBookCharactersTable.id });

    return result.length > 0 ? result[0].id : 0;
  } catch (error) {
    console.error("Error adding comic book character relation:", error);
    throw error;
  }
};

// Publishers

/**
 * Add a publisher relation to a comic book.
 * @param relation NewComicBookPublisher The publisher relation to add.
 * @returns Promise<number> The ID of the newly added publisher relation.
 */
export const addComicBookPublisher = async (
  relation: NewComicBookPublisher,
): Promise<number> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .insert(comicBookPublishersTable)
      .values(relation)
      .onConflictDoNothing()
      .returning({ id: comicBookPublishersTable.id });

    return result.length > 0 ? result[0].id : 0;
  } catch (error) {
    console.error("Error adding comic book publisher relation:", error);
    throw error;
  }
};

// Genres

/**
 * Add a genre relation to a comic book.
 * @param relation NewComicBookGenre The genre relation to add.
 * @returns Promise<number> The ID of the newly added genre relation.
 */
export const addComicBookGenre = async (
  relation: NewComicBookGenre,
): Promise<number> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .insert(comicBookGenresTable)
      .values(relation)
      .onConflictDoNothing()
      .returning({ id: comicBookGenresTable.id });

    return result.length > 0 ? result[0].id : 0;
  } catch (error) {
    console.error("Error adding comic book genre relation:", error);
    throw error;
  }
};

/**
 * Utility function to remove all relations for a comic book
 * @param comicBookId
 */
export const removeAllComicBookRelations = async (
  comicBookId: number,
): Promise<void> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    // Remove all relationship entries for this comic book
    await Promise.all([
      db.delete(comicBookWritersTable).where(
        eq(comicBookWritersTable.comicBookId, comicBookId),
      ),
      db.delete(comicBookPencillersTable).where(
        eq(comicBookPencillersTable.comicBookId, comicBookId),
      ),
      db.delete(comicBookInkersTable).where(
        eq(comicBookInkersTable.comicBookId, comicBookId),
      ),
      db.delete(comicBookColoristsTable).where(
        eq(comicBookColoristsTable.comicBookId, comicBookId),
      ),
      db.delete(comicBookLetterersTable).where(
        eq(comicBookLetterersTable.comicBookId, comicBookId),
      ),
      db.delete(comicBookEditorsTable).where(
        eq(comicBookEditorsTable.comicBookId, comicBookId),
      ),
      db.delete(comicBookCoverArtistsTable).where(
        eq(comicBookCoverArtistsTable.comicBookId, comicBookId),
      ),
      db.delete(comicBookPublishersTable).where(
        eq(comicBookPublishersTable.comicBookId, comicBookId),
      ),
      db.delete(comicBookImprintsTable).where(
        eq(comicBookImprintsTable.comicBookId, comicBookId),
      ),
      db.delete(comicBookGenresTable).where(
        eq(comicBookGenresTable.comicBookId, comicBookId),
      ),
      db.delete(comicBookCharactersTable).where(
        eq(comicBookCharactersTable.comicBookId, comicBookId),
      ),
      db.delete(comicBookLocationsTable).where(
        eq(comicBookLocationsTable.comicBookId, comicBookId),
      ),
      db.delete(comicBookTeamsTable).where(
        eq(comicBookTeamsTable.comicBookId, comicBookId),
      ),
      db.delete(comicBookStoryArcsTable).where(
        eq(comicBookStoryArcsTable.comicBookId, comicBookId),
      ),
      db.delete(comicBookSeriesGroupsTable).where(
        eq(comicBookSeriesGroupsTable.comicBookId, comicBookId),
      ),
    ]);
  } catch (error) {
    console.error("Error removing comic book relations:", error);
    throw error;
  }
};
