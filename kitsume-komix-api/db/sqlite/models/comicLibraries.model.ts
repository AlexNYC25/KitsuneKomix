import { getClient } from "../client.ts";
import { comicLibrariesTable, userComicLibrariesTable} from "../schema.ts";
import type {
  ComicLibrary,
  LibraryRegistrationInput,
  LibraryUpdateInput,
} from "../../../types/index.ts";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";

export const createComicLibrary = async (
  library: LibraryRegistrationInput,
): Promise<number> => {
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

export const getAllComicLibraries = async (): Promise<ComicLibrary[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db.select().from(comicLibrariesTable);
    return result;
  } catch (error) {
    console.error("Error fetching comic libraries:", error);
    throw error;
  }
};

export const getComicLibraryById = async (
  id: number,
): Promise<ComicLibrary | null> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db.select().from(comicLibrariesTable).where(
      eq(comicLibrariesTable.id, id),
    );
    if (result.length === 0) return null;

    return result[0];
  } catch (error) {
    console.error("Error fetching comic library by ID:", error);
    throw error;
  }
};

export const getComicLibraryByPath = async (
  path: string,
): Promise<ComicLibrary | null> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db.select().from(comicLibrariesTable).where(
      eq(comicLibrariesTable.path, path),
    );
    if (result.length === 0) return null;

    return result[0];
  } catch (error) {
    console.error("Error fetching comic library by path:", error);
    throw error;
  }
};

export const getLibraryContainingPath = async (
  filePath: string,
): Promise<ComicLibrary | null> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    // Get all enabled libraries
    const libraries = await db.select().from(comicLibrariesTable).where(
      eq(comicLibrariesTable.enabled, 1),
    );

    // Find the library whose path is a parent of the file path
    for (const library of libraries) {
      // Normalize paths by ensuring they end with / for proper comparison
      const libraryPath = library.path.endsWith("/")
        ? library.path
        : library.path + "/";
      const normalizedFilePath = filePath.endsWith("/")
        ? filePath
        : filePath + "/";

      if (normalizedFilePath.startsWith(libraryPath)) {
        return library;
      }
    }
    return null;
  } catch (error) {
    console.error("Error finding library containing path:", error);
    throw error;
  }
};

export const getComicLibraryLastChangedTime = async (
  id: number,
): Promise<string | null> => {
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

export const updateComicLibrary = async (
  id: number,
  updates: LibraryUpdateInput,
): Promise<boolean> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const updateData: Record<string, unknown> = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.path !== undefined) updateData.path = updates.path;
    if (updates.description !== undefined) {
      updateData.description = updates.description;
    }
    if (updates.enabled !== undefined) {
      updateData.enabled = updates.enabled ? 1 : 0;
    }

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


/**
 * Get all comic libraries for a specific user.
 * @param userId - ID of the user
 * @returns Array of comic libraries (type ComicLibrary[]) associated with the user
 */
export const getUsersComicLibraries = async (
  userId: number,
): Promise<ComicLibrary[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result = await db
      .select(
        { id: comicLibrariesTable.id,
          name: comicLibrariesTable.name,
          description: comicLibrariesTable.description,
          path: comicLibrariesTable.path,
          enabled: comicLibrariesTable.enabled,
          changed_at: comicLibrariesTable.changed_at,
          created_at: comicLibrariesTable.created_at,
          updated_at: comicLibrariesTable.updated_at
        }
      )
      .from(comicLibrariesTable)
      .innerJoin(userComicLibrariesTable, eq(comicLibrariesTable.id, userComicLibrariesTable.library_id))
      .where(eq(userComicLibrariesTable.user_id, userId))
      .groupBy(comicLibrariesTable.id);

    return result;
  } catch (error) {
    console.error("Error fetching user's comic libraries:", error);
    throw error;
  }
};

/**
 * Assign a comic library to a user by creating an entry in the user_comic_libraries table.
 * 
 * @param userId - ID of the user
 * @param libraryId - ID of the comic library to assign
 */
export const assignLibraryToUser = async (
  userId: number,
  libraryId: number,
): Promise<void> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    await db
      .insert(userComicLibrariesTable)
      .values({
        user_id: userId,
        library_id: libraryId,
      });

  } catch (error) {
    console.error("Error assigning library to user:", error);
    throw error;
  }
};