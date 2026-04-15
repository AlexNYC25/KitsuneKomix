import type { z } from "zod"; 

import type { ComicLibraryCreateSchema } from "#zod/schemas/data/comicLibraries.schema.ts"

export type LibraryRegistrationInput = z.infer<typeof ComicLibraryCreateSchema>;

export type LibraryUpdateInput = {
  name?: string;
  description?: string;
  path?: string;
  enabled?: boolean;
};
