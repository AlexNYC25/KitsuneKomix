import { sql, eq } from "drizzle-orm";

import { getClient } from "../client.ts";
import { comicLibrariesTable, userComicLibrariesTable } from "../schema.ts";

import type {
  ComicLibrary,
  LibraryRegistrationInput,
  LibraryUpdateInput,
} from "#types/index.ts";


/**
 * Creates a new comic library in the database
 * @param library The library registration input with name, path, and optional description
 * @returns The ID of the newly created comic library
 */
export const createComicLibrary = async (
  library: LibraryRegistrationInput,
): Promise<number> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { id: number }[] = await db
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

/**
 * Retrieves all comic libraries from the database
 * @returns An array of all ComicLibrary objects
 */
export const getAllComicLibraries = async (): Promise<ComicLibrary[]> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: ComicLibrary[] = await db.select().from(comicLibrariesTable);
    return result;
  } catch (error) {
    console.error("Error fetching comic libraries:", error);
    throw error;
  }
};

/**
 * Retrieves a specific comic library by its ID
 * @param id The ID of the comic library to retrieve
 * @returns The ComicLibrary object if found, null otherwise
 */
export const getComicLibraryById = async (
  id: number,
): Promise<ComicLibrary | null> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: ComicLibrary[] = await db
      .select()
      .from(comicLibrariesTable)
      .where(
        eq(comicLibrariesTable.id, id),
      );

    if (result.length === 0) return null;

    return result[0];
  } catch (error) {
    console.error("Error fetching comic library by ID:", error);
    throw error;
  }
};

/**
 * Retrieves a comic library by its file system path
 * @param path The file system path to search for
 * @returns The ComicLibrary object if found, null otherwise
 */
export const getComicLibraryByPath = async (
  path: string,
): Promise<ComicLibrary | null> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: ComicLibrary[] = await db
      .select()
      .from(comicLibrariesTable)
      .where(
        eq(comicLibrariesTable.path, path),
      );

    if (result.length === 0) return null;

    return result[0];
  } catch (error) {
    console.error("Error fetching comic library by path:", error);
    throw error;
  }
};

/**
 * Finds the comic library that contains the given file path
 * Searches through enabled libraries and returns the one whose path is a parent directory of the file path
 * @param filePath The file path to search for
 * @returns The ComicLibrary object containing the path, null if no library contains it
 */
export const getLibraryContainingPath = async (
  filePath: string,
): Promise<ComicLibrary | null> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    // Get all enabled libraries
    const libraries: ComicLibrary[] = await db
      .select()
      .from(comicLibrariesTable)
      .where(
        eq(comicLibrariesTable.enabled, 1),
      );

    // Find the library whose path is a parent of the file path
    for (const library of libraries) {
      // Normalize paths by ensuring they end with / for proper comparison
      const libraryPath: string = library.path.endsWith("/")
        ? library.path
        : library.path + "/";
      const normalizedFilePath: string = filePath.endsWith("/")
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

/**
 * Retrieves the last changed timestamp of a comic library
 * @param id The ID of the comic library
 * @returns The timestamp string of when the library was last changed, null if not found
 */
export const getComicLibraryLastChangedTime = async (
  id: number,
): Promise<string | null> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { changedAt: string }[] = await db
      .select({ changedAt: comicLibrariesTable.changedAt })
      .from(comicLibrariesTable)
      .where(eq(comicLibrariesTable.id, id));

    return result.length > 0 ? result[0].changedAt : null;
  } catch (error) {
    console.error("Error fetching comic library changed time:", error);
    throw error;
  }
};

/**
 * Updates the changed timestamp of a comic library to the current time
 * @param id The ID of the comic library to update
 * @returns A promise that resolves when the timestamp has been updated
 */
export const setComicLibraryChangedTime = async (id: number): Promise<void> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    await db
      .update(comicLibrariesTable)
      .set({ changedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(comicLibrariesTable.id, id));
  } catch (error) {
    console.error("Error updating comic library changed time:", error);
    throw error;
  }
};

/**
 * Updates an existing comic library with the provided changes
 * @param id The ID of the comic library to update
 * @param updates The fields to update (name, path, description, enabled)
 * @returns A boolean indicating whether the update was successful
 */
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

    const result: { id: number }[] = await db
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

/**
 * Deletes a comic library from the database
 * @param id The ID of the comic library to delete
 * @returns A boolean indicating whether the deletion was successful
 */
export const deleteComicLibrary = async (id: number): Promise<boolean> => {
  const { db, client } = getClient();

  if (!db || !client) {
    throw new Error("Database is not initialized.");
  }

  try {
    const result: { id: number }[] = await db
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
    const result: { comicLibrary: ComicLibrary }[] = await db
      .select(
        { comicLibrary: comicLibrariesTable },
      )
      .from(comicLibrariesTable)
      .innerJoin(
        userComicLibrariesTable,
        eq(comicLibrariesTable.id, userComicLibrariesTable.libraryId),
      )
      .where(eq(userComicLibrariesTable.userId, userId))
      .groupBy(comicLibrariesTable.id);
      
    const libraries: ComicLibrary[] = result.map(row => row.comicLibrary);

    return libraries;
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
        userId: userId,
        libraryId: libraryId,
      });
  } catch (error) {
    console.error("Error assigning library to user:", error);
    throw error;
  }
};
