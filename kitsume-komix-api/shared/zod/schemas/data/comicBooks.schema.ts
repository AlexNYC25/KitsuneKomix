import { z } from "@hono/zod-openapi";

import {
  ComicBookSelectSchema,
  ComicBookThumbnailSelectSchema,
} from "./database.schema.ts";
import { MetadataSchema } from "./comicMetadata.schema.ts";

/**
 * Schemas for comic books
 * Including the main ComicBookSchema which extends the base ComicBookSelectSchema with additional fields for metadata and thumbnails, as well as any other relevant information we want to include in the API responses for comic books.
 */
export const ComicBookSchema: z.ZodObject = ComicBookSelectSchema.extend({
  metadata: MetadataSchema.optional(),
  thumbnails: z.array(ComicBookThumbnailSelectSchema).optional(),
}).openapi({
  title: "ComicBook",
  description:
    "Schema representing a comic book, including optional metadata and thumbnails",
});
