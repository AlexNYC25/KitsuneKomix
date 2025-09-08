import { getClient } from "../client.ts";
import { 
  comicBookWritersTable,
  comicBookPencillersTable,
  comicBookInkersTable,
  comicBookColoristsTable,
  comicBookLetterersTable,
  comicBookEditorsTable,
  comicBookCoverArtistsTable,
  comicBookPublishersTable,
  comicBookImprintsTable,
  comicBookGenresTable,
  comicBookCharactersTable,
  comicBookLocationsTable,
  comicBookTeamsTable,
  comicBookStoryArcsTable,
  comicBookSeriesGroupsTable
} from "../schema.ts";
import type { 
  NewComicBookWriter,
  NewComicBookPenciller,
  NewComicBookPublisher,
  NewComicBookGenre,
  NewComicBookCharacter
} from "../../../types/index.ts";
import { eq } from "drizzle-orm";

// Writers
export const addComicBookWriter = async (relation: NewComicBookWriter): Promise<number> => {
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

export const removeComicBookWriter = async (comicBookId: number, writerId: number): Promise<boolean> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .delete(comicBookWritersTable)
      .where(
        eq(comicBookWritersTable.comic_book_id, comicBookId) &&
        eq(comicBookWritersTable.comic_writer_id, writerId)
      )
      .returning({ id: comicBookWritersTable.id });

    return result.length > 0;
  } catch (error) {
    console.error("Error removing comic book writer relation:", error);
    throw error;
  }
};

// Pencillers
export const addComicBookPenciller = async (relation: NewComicBookPenciller): Promise<number> => {
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
export const addComicBookCharacter = async (relation: NewComicBookCharacter): Promise<number> => {
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
export const addComicBookPublisher = async (relation: NewComicBookPublisher): Promise<number> => {
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
export const addComicBookGenre = async (relation: NewComicBookGenre): Promise<number> => {
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

// Utility function to remove all relations for a comic book
export const removeAllComicBookRelations = async (comicBookId: number): Promise<void> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    // Remove all relationship entries for this comic book
    await Promise.all([
      db.delete(comicBookWritersTable).where(eq(comicBookWritersTable.comic_book_id, comicBookId)),
      db.delete(comicBookPencillersTable).where(eq(comicBookPencillersTable.comic_book_id, comicBookId)),
      db.delete(comicBookInkersTable).where(eq(comicBookInkersTable.comic_book_id, comicBookId)),
      db.delete(comicBookColoristsTable).where(eq(comicBookColoristsTable.comic_book_id, comicBookId)),
      db.delete(comicBookLetterersTable).where(eq(comicBookLetterersTable.comic_book_id, comicBookId)),
      db.delete(comicBookEditorsTable).where(eq(comicBookEditorsTable.comic_book_id, comicBookId)),
      db.delete(comicBookCoverArtistsTable).where(eq(comicBookCoverArtistsTable.comic_book_id, comicBookId)),
      db.delete(comicBookPublishersTable).where(eq(comicBookPublishersTable.comic_book_id, comicBookId)),
      db.delete(comicBookImprintsTable).where(eq(comicBookImprintsTable.comic_book_id, comicBookId)),
      db.delete(comicBookGenresTable).where(eq(comicBookGenresTable.comic_book_id, comicBookId)),
      db.delete(comicBookCharactersTable).where(eq(comicBookCharactersTable.comic_book_id, comicBookId)),
      db.delete(comicBookLocationsTable).where(eq(comicBookLocationsTable.comic_book_id, comicBookId)),
      db.delete(comicBookTeamsTable).where(eq(comicBookTeamsTable.comic_book_id, comicBookId)),
      db.delete(comicBookStoryArcsTable).where(eq(comicBookStoryArcsTable.comic_book_id, comicBookId)),
      db.delete(comicBookSeriesGroupsTable).where(eq(comicBookSeriesGroupsTable.comic_book_id, comicBookId))
    ]);
  } catch (error) {
    console.error("Error removing comic book relations:", error);
    throw error;
  }
};
