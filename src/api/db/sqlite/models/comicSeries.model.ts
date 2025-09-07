import { getClient } from "../client.ts";
import { comicSeriesTable } from "../schema.ts";
import type { 
  ComicSeries, 
  NewComicSeries 
} from "../../../types/index.ts";
import { eq } from "drizzle-orm";

export const insertComicSeries = async (seriesData: NewComicSeries): Promise<number> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .insert(comicSeriesTable)
      .values(seriesData)
      .onConflictDoNothing()
      .returning({ id: comicSeriesTable.id });

    return result[0].id;
  } catch (error) {
    console.error("Error inserting comic series:", error);
    throw error;
  }
};

export const getComicSeriesById = async (id: number): Promise<ComicSeries | null> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db.select().from(comicSeriesTable).where(eq(comicSeriesTable.id, id));
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Error fetching comic series by ID:", error);
    throw error;
  }
};

export const getComicSeriesByName = async (name: string): Promise<ComicSeries | null> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db.select().from(comicSeriesTable).where(eq(comicSeriesTable.name, name));
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Error fetching comic series by name:", error);
    throw error;
  }
};

export const getComicSeriesByPath = async (folderPath: string): Promise<ComicSeries | null> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db.select().from(comicSeriesTable).where(eq(comicSeriesTable.folder_path, folderPath));
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Error fetching comic series by path:", error);
    throw error;
  }
};

export const getAllComicSeries = async (): Promise<ComicSeries[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db.select().from(comicSeriesTable);
    return result;
  } catch (error) {
    console.error("Error fetching all comic series:", error);
    throw error;
  }
};

export const updateComicSeries = async (id: number, updates: Partial<NewComicSeries>): Promise<boolean> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const updateData: Record<string, unknown> = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.folder_path !== undefined) updateData.folder_path = updates.folder_path;

    if (Object.keys(updateData).length === 0) {
      return false;
    }

    const result = await db
      .update(comicSeriesTable)
      .set(updateData)
      .where(eq(comicSeriesTable.id, id))
      .returning({ id: comicSeriesTable.id });

    return result.length > 0;
  } catch (error) {
    console.error("Error updating comic series:", error);
    throw error;
  }
};

export const deleteComicSeries = async (id: number): Promise<boolean> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .delete(comicSeriesTable)
      .where(eq(comicSeriesTable.id, id))
      .returning({ id: comicSeriesTable.id });

    return result.length > 0;
  } catch (error) {
    console.error("Error deleting comic series:", error);
    throw error;
  }
};
