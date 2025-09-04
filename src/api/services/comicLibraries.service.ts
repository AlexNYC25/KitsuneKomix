import {
  LibraryRegistrationInput,
  NewLibrary,
} from "../types/comicLibrary.type.ts";
import { createComicLibrary } from "../repositories/comicLibraries.repo.ts";

export function registerComicLibrary(
  libraryData: LibraryRegistrationInput,
): number {
  const newLibrary: NewLibrary = {
    name: libraryData.name,
    description: libraryData.description ?? null,
    path: libraryData.path,
    enabled: libraryData.enabled,
  };

  //TODO: Add check to make sure the path is not already registered, and it does not fall within another registered library path

  try {
    const newLibraryId = createComicLibrary(newLibrary);
    return newLibraryId;
  } catch (error) {
    console.error("Error registering comic library:", error);
    throw new Error("Internal server error");
  }
}
