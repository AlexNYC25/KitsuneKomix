import z from "zod";
import { ComicLibrarySelectSchema } from "./database.schema.ts";

/**
 * Schema for a list of comic libraries
 */
export const ComicLibrariesSchema = z.object({
  libraries: z.array(ComicLibrarySelectSchema),
}).openapi({
  title: "ComicLibrariesResponse",
  description: "Response schema for a list of comic libraries",
});
