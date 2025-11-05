import { z } from "@hono/zod-openapi";

import { comicBooksTable } from "../../../db/sqlite/schema.ts";
import { createSelectSchema } from "../../factory.ts";
import { toCamelCaseSchema } from "../../utils/openapi-helpers.ts";

export const comicBookSelectSchema: z.ZodObject = createSelectSchema(
  comicBooksTable,
)

export const comicBookSelectJoinedWithThumbnailSchema = createSelectSchema(
  comicBooksTable,
)
  .extend({
    thumbnailUrl: z.string().nullable().optional(),
  })

// Use helper to convert to camelCase (no .transform(), fully OpenAPI compatible)
export const comicBookSelectJoinedWithThumbnailCamelCaseSchema = toCamelCaseSchema(
  comicBookSelectJoinedWithThumbnailSchema,
  {
    title: "ComicBookWithThumbnail",
    description: "A comic book with its thumbnail URL in camelCase format",
  }
);
