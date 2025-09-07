import { getClient } from "../client.ts";
import { comicLibrariesTable } from "../schema.ts";
import type { LibraryRow, NewLibrary } from "../../../types/comicLibrary.type.ts";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";

export const createComicLibrary = async (library: NewLibrary): Promise<number> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .insert(comicLibrariesTable)
      .values({
        name: library.name,
        path: library.path,
        description: library.description ?? null,
        enabled: library.enabled ? 1 : 0,
      })
      .returning({ id: comicLibrariesTable.id });

    return result[0].id;
  } catch (error) {
    console.error("Error creating comic library:", error);
    throw error;
  }
};

export const getAllComicLibraries = async (): Promise<LibraryRow[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db.select().from(comicLibrariesTable);
    return result.map(row => ({
      ...row,
      enabled: Boolean(row.enabled)
    })) as LibraryRow[];
  } catch (error) {
    console.error("Error fetching comic libraries:", error);
    throw error;
  }
};

export const getComicLibraryById = async (id: number): Promise<LibraryRow | null> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db.select().from(comicLibrariesTable).where(eq(comicLibrariesTable.id, id));
    if (result.length === 0) return null;
    
    const row = result[0];
    return {
      ...row,
      enabled: Boolean(row.enabled)
    } as LibraryRow;
  } catch (error) {
    console.error("Error fetching comic library by ID:", error);
    throw error;
  }
};

export const getComicLibraryByPath = async (path: string): Promise<LibraryRow | null> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db.select().from(comicLibrariesTable).where(eq(comicLibrariesTable.path, path));
    if (result.length === 0) return null;
    
    const row = result[0];
    return {
      ...row,
      enabled: Boolean(row.enabled)
    } as LibraryRow;
  } catch (error) {
    console.error("Error fetching comic library by path:", error);
    throw error;
  }
};

export const getComicLibraryLastChangedTime = async (id: number): Promise<string | null> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .select({ changed_at: comicLibrariesTable.changed_at })
      .from(comicLibrariesTable)
      .where(eq(comicLibrariesTable.id, id));
    
    return result.length > 0 ? result[0].changed_at : null;
  } catch (error) {
    console.error("Error fetching comic library changed time:", error);
    throw error;
  }
};

export const setComicLibraryChangedTime = async (id: number): Promise<void> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    await db
      .update(comicLibrariesTable)
      .set({ changed_at: sql`CURRENT_TIMESTAMP` })
      .where(eq(comicLibrariesTable.id, id));
  } catch (error) {
    console.error("Error updating comic library changed time:", error);
    throw error;
  }
};

export const updateComicLibrary = async (id: number, updates: Partial<{
  name: string;
  path: string;
  description?: string | null;
  enabled: boolean;
}>): Promise<boolean> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const updateData: Record<string, unknown> = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.path !== undefined) updateData.path = updates.path;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.enabled !== undefined) updateData.enabled = updates.enabled ? 1 : 0;

    const result = await db
      .update(comicLibrariesTable)
      .set(updateData)
      .where(eq(comicLibrariesTable.id, id))
      .returning({ id: comicLibrariesTable.id });

    return result.length > 0;
  } catch (error) {
    console.error("Error updating comic library:", error);
    throw error;
  }
};

export const deleteComicLibrary = async (id: number): Promise<boolean> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .delete(comicLibrariesTable)
      .where(eq(comicLibrariesTable.id, id))
      .returning({ id: comicLibrariesTable.id });

    return result.length > 0;
  } catch (error) {
    console.error("Error deleting comic library:", error);
    throw error;
  }
};
