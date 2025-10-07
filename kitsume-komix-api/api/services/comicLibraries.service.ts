
import { getUsersComicLibraries, getAllComicLibraries } from "../../db/sqlite/models/comicLibraries.model.ts";
import { getUserById } from "../../db/sqlite/models/users.model.ts";
import type { ComicLibrary } from "../../types/index.ts";

/**
 * Get the comic libraries that are available to a user.
 * @param userId - ID of the user
 * @returns An array of comic libraries available to the user
 */
export const getComicLibrariesAvailableToUser = async (userId: number): Promise<Array<ComicLibrary>> => {
  try {
    const user = await getUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (user.admin) {
      // Admins can see all libraries
      return await getAllComicLibraries();
    } else {
      // Regular users can see only libraries they have access to
      return await getUsersComicLibraries(userId);
    }
  } catch (error) {
    console.error("Error fetching comic libraries:", error);
    return [];
  }
};