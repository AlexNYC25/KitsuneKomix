import { eq } from "drizzle-orm";

import { getClient } from "../client.ts";

import { comicSeriesTable, comicSeriesBooks } from "../schema.ts";
import type { ComicSeries, NewComicSeries } from "../../../types/index.ts";

export const insertComicSeries = async (
  seriesData: NewComicSeries,
): Promise<number> => {
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

    // If result is empty, it means the series already exists due to onConflictDoNothing
    if (result.length === 0) {
      // Find the existing series by folder_path (which should be unique)
      if (seriesData.folder_path) {
        const existingSeries = await db
          .select({ id: comicSeriesTable.id })
          .from(comicSeriesTable)
          .where(eq(comicSeriesTable.folder_path, seriesData.folder_path));

        if (existingSeries.length > 0) {
          console.log(
            `Comic series already exists at path: ${seriesData.folder_path}, returning existing ID: ${
              existingSeries[0].id
            }`,
          );
          return existingSeries[0].id;
        }
      }

      /*
      // If we can't find by folder_path, try by name
      if (seriesData.name) {
        const existingSeriesByName = await db
          .select({ id: comicSeriesTable.id })
          .from(comicSeriesTable)
          .where(eq(comicSeriesTable.name, seriesData.name));

        if (existingSeriesByName.length > 0) {
          console.log(`Comic series already exists with name: ${seriesData.name}, returning existing ID: ${existingSeriesByName[0].id}`);
          return existingSeriesByName[0].id;
        }
      }
      */

      throw new Error(
        `Failed to insert comic series and could not find existing series. Data: ${
          JSON.stringify(seriesData)
        }`,
      );
    }

    return result[0].id;
  } catch (error) {
    console.error("Error inserting comic series:", error);
    throw error;
  }
};

export const getComicSeriesById = async (
  id: number,
): Promise<ComicSeries | null> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db.select().from(comicSeriesTable).where(
      eq(comicSeriesTable.id, id),
    );
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Error fetching comic series by ID:", error);
    throw error;
  }
};

export const getComicSeriesByName = async (
  name: string,
): Promise<ComicSeries | null> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db.select().from(comicSeriesTable).where(
      eq(comicSeriesTable.name, name),
    );
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Error fetching comic series by name:", error);
    throw error;
  }
};

export const getComicSeriesByPath = async (
  folderPath: string,
): Promise<ComicSeries | null> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db.select().from(comicSeriesTable).where(
      eq(comicSeriesTable.folder_path, folderPath),
    );
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

export const updateComicSeries = async (
  id: number,
  updates: Partial<NewComicSeries>,
): Promise<boolean> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const updateData: Record<string, unknown> = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) {
      updateData.description = updates.description;
    }
    if (updates.folder_path !== undefined) {
      updateData.folder_path = updates.folder_path;
    }

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

export const addComicBookToSeries = async (
  seriesId: number,
  comicBookId: number,
): Promise<boolean> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .insert(comicSeriesBooks)
      .values({
        comic_series_id: seriesId,
        comic_book_id: comicBookId,
      })
      .onConflictDoNothing()
      .returning({ id: comicSeriesBooks.id });

    return result.length > 0;
  } catch (error) {
    console.error("Error adding comic book to series:", error);
    throw error;
  }
};

export const getComicBooksInSeries = async (
  seriesId: number,
): Promise<number[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }
  
  try {
    const result = await db
      .select()
      .from(comicSeriesBooks)
      .where(eq(comicSeriesBooks.comic_series_id, seriesId));

    return result.map((row) => row.id);
  } catch (error) {
    console.error("Error fetching comic books in series:", error);
    throw error;
  }
};

export const getSeriesIdFromComicBook = async (
  comicBookId: number,
): Promise<number | null> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .select()
      .from(comicSeriesBooks)
      .where(eq(comicSeriesBooks.comic_book_id, comicBookId));

    return result.length > 0 ? result[0].comic_series_id : null;
  } catch (error) {
    console.error("Error fetching series ID from comic book ID:", error);
    throw error;
  }
};
