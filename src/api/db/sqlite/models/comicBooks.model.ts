import { getClient } from "../client.ts";
import { comicBooksTable } from "../schema.ts";
import type { 
  ComicBook, 
  NewComicBook
} from "../../../types/index.ts";
import { eq } from "drizzle-orm";

export const getAllComicBooks = async () => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    db.select().from(comicBooksTable);
    const result = await client.execute(db.select().from(comicBooksTable).toSQL());
    return result.rows;
  } catch (error) {
    console.error("Error fetching comic books:", error);
    throw error;
  }
};

export const insertComicBook = async (comicBook: NewComicBook) => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const insertQuery = await db
      .insert(comicBooksTable)
      .values(comicBook)
      .returning({ id: comicBooksTable.id });

    return insertQuery[0].id;
  } catch (error) {
    console.error("Error inserting comic book:", error);
    throw error;
  }
};

export const getComicBookById = async (id: number): Promise<ComicBook | null> => {
  const { db, client } = getClient();
  
  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db.select().from(comicBooksTable).where(eq(comicBooksTable.id, id));
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Error fetching comic book by ID:", error);
    throw error;
  }
};

export const getComicBookByFilePath = async (filePath: string): Promise<ComicBook | null> => {
  const { db, client } = getClient();
  
  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db.select().from(comicBooksTable).where(eq(comicBooksTable.file_path, filePath));
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Error fetching comic book by file path:", error);
    throw error;
  }
};

export const updateComicBook = async (id: number, updates: Partial<{
  library_id: number;
  file_path: string;
  title: string;
  series?: string | null;
  issue_number?: string | null;
  volume?: string | null;
  publisher?: string | null;
  publication_date?: string | null;
  tags?: string | null;
  read?: boolean;
}>) => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const updateData: Record<string, unknown> = {};
    if (updates.library_id !== undefined) updateData.library_id = updates.library_id;
    if (updates.file_path !== undefined) updateData.file_path = updates.file_path;
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.series !== undefined) updateData.series = updates.series ?? null;
    if (updates.issue_number !== undefined) updateData.issue_number = updates.issue_number ?? null;
    if (updates.volume !== undefined) updateData.volume = updates.volume ?? null;
    if (updates.publisher !== undefined) updateData.publisher = updates.publisher ?? null;
    if (updates.publication_date !== undefined) updateData.publication_date = updates.publication_date ?? null;
    if (updates.tags !== undefined) updateData.tags = updates.tags ?? null;
    if (updates.read !== undefined) updateData.read = updates.read ? 1 : 0;

    const result = await db
      .update(comicBooksTable)
      .set(updateData)
      .where(eq(comicBooksTable.id, id))
      .returning({ id: comicBooksTable.id });

    return result.length > 0;
  } catch (error) {
    console.error("Error updating comic book:", error);
    throw error;
  }
};