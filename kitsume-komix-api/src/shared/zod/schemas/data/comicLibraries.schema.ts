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
 * Schema for a list of comic libraries
 */
export const ComicLibrariesSchema = z.object({
  libraries: z.array(ComicLibrarySelectSchema),
}).openapi({
  title: "ComicLibrariesResponse",
  description: "Response schema for a list of comic libraries",
});
