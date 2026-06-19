import type { z } from "zod"; 


import type { ComicLibraryCreateSchema, ComicLibraryUpdateSchema, ComicLibraryCompiledInfoSchema, ComicLibrariesAssignmentSchema } from "#zod/schemas/data/comicLibraries.schema.ts"

export type LibraryRegistrationInput = z.infer<typeof ComicLibraryCreateSchema>;

export type LibraryAssignmentsInput = z.infer<typeof ComicLibrariesAssignmentSchema>;

export type LibraryUpdateInput = z.infer<typeof ComicLibraryUpdateSchema>;

export type LibraryCompiledInfo = z.infer<typeof ComicLibraryCompiledInfoSchema>;