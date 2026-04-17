import type { z } from "zod"; 

import type { ComicLibraryCreateSchema, ComicLibraryUpdateSchema } from "#zod/schemas/data/comicLibraries.schema.ts"

export type LibraryRegistrationInput = z.infer<typeof ComicLibraryCreateSchema>;

export type LibraryUpdateInput = z.infer<typeof ComicLibraryUpdateSchema>;