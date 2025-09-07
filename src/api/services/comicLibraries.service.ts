import {
  LibraryRegistrationInput,
} from "../types/index.ts";
import { createComicLibrary } from "../db/sqlite/models/comicLibraries.model.ts";

export async function registerComicLibrary(
  libraryData: LibraryRegistrationInput,
): Promise<number> {
  //TODO: Add check to make sure the path is not already registered, and it does not fall within another registered library path

  try {
    const newLibraryId = await createComicLibrary(libraryData);
    return newLibraryId;
  } catch (error) {
    console.error("Error registering comic library:", error);
    throw new Error("Internal server error");
  }
}
