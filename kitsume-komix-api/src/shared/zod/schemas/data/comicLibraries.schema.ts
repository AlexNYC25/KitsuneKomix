import z from "zod";
import { ComicLibrarySelectSchema } from "./database.schema.ts";

/**
 * Schema for creating a comic library
 */
export const ComicLibraryCreateSchema = ComicLibrarySelectSchema.omit({ 
  id: true,
  enabled: true,
  changedAt: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  description: z.string().optional(),
}).openapi({
  title: "ComicLibraryCreate",
  description: "Schema for creating a comic library",
});

/**
 * Schema for updating a comic library
 */
export const ComicLibraryUpdateSchema = ComicLibrarySelectSchema.omit({ 
  changedAt: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  description: z.string().optional(),
  enabled: z.boolean().optional(),
  name: z.string().optional(),
  path: z.string().optional(),
}).openapi({
  title: "ComicLibraryUpdate",
  description: "Schema for updating a comic library",
});

export const ComicLibraryCompiledInfoSchema = ComicLibrarySelectSchema.extend({
  totalNumberOfSeries: z.number().default(0),
  totalNumberOfBooks: z.number().default(0),
  totalNumberOfUsers: z.number().default(0),
  totalSize: z.number().default(0)
}).openapi({
  title: "ComicLibraryCompiledInfo",
  description: "Schema for compiled information of a comic library",
});

/**
 * Schema for a list of comic libraries
 */
export const ComicLibrariesSchema = z.object({
  libraries: z.array(ComicLibrarySelectSchema),
}).openapi({
  title: "ComicLibrariesResponse",
  description: "Response schema for a list of comic libraries",
});
