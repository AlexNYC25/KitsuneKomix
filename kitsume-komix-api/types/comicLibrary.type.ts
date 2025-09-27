import {
  ComicLibrary,
  ComicLibraryWithBooks,
  NewComicLibrary,
} from "./database.types.ts";

// Re-export database types
export type { ComicLibrary, ComicLibraryWithBooks, NewComicLibrary };

// Legacy types for backward compatibility
export type LibraryRow = ComicLibrary;

export type LibraryDomain = {
  id: number;
  name: string;
  description?: string;
  path: string;
  enabled: boolean;
  changedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type LibraryRegistrationInput = {
  name: string;
  description?: string;
  path: string;
  enabled?: boolean;
};

export type LibraryUpdateInput = {
  name?: string;
  description?: string;
  path?: string;
  enabled?: boolean;
};
