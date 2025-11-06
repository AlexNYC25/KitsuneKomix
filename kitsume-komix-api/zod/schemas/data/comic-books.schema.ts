import { z } from "@hono/zod-openapi";

import { comicBooksTable } from "../../../db/sqlite/schema.ts";
import { createSelectSchema } from "../../factory.ts";
import { toCamelCaseSchema } from "../../utils/openapi-helpers.ts";

/**
 * Schemas for comic books
 * 
 * Direct schema from the comicBooksTable
 */
export const comicBookSelectSchema: z.ZodObject = createSelectSchema(
  comicBooksTable,
)

/**
 * Schema for comic books joined with their thumbnail URL
 * 
 * Extends the base comic book schema with a nullable thumbnailUrl field
 */
export const comicBookSelectJoinedWithThumbnailSchema = createSelectSchema(
  comicBooksTable,
)
.extend({
  thumbnailUrl: z.string().nullable().optional(),
})

/**
 * CamelCase version for OpenAPI compatibility of the comic book with thumbnail schema
 */
export const comicBookSelectJoinedWithThumbnailCamelCaseSchema = toCamelCaseSchema(
  comicBookSelectJoinedWithThumbnailSchema,
  {
    title: "ComicBookWithThumbnail",
    description: "A comic book with its thumbnail URL in camelCase format",
  }
);
