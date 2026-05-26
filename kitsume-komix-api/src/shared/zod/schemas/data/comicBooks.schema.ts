import { z } from "zod";

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
  thumbnailUrl: z.url().openapi({
    description: "URL to the primary thumbnail image for the comic book",
    example: "https://example.com/image/thumbnails/cover123.jpg",
  }).optional(),
}).openapi({
  title: "ComicBook",
  description:
    "Schema representing a comic book, including optional metadata and thumbnails",
});
