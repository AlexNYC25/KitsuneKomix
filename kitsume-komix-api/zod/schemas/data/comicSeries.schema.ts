import { z } from "@hono/zod-openapi";

import {
  ComicSeriesSelectSchema,
  ComicBookThumbnailSelectSchema
} from "./database.schema.ts";
import { 
  MetadataSchema 
} from "./comicMetadata.schema.ts";
import {
  ComicBookSchema
} from "./comicBooks.schema.ts";

/**
 * Schema for comic series, extending the base ComicSeriesSelectSchema with additional fields for thumbnail and metadata. This schema represents the structure of a comic series as it will be returned in API responses, including optional fields for a thumbnail image and associated metadata.
 */
export const ComicSeriesSchema = ComicSeriesSelectSchema.extend(
  {
    totalComicBooks: z.number().openapi({
      description: "Total number of comic books in the series",
      example: 42,
    }),
    totalSize: z.number().openapi({
      description: "Total file size of all comic books in the series (in bytes)",
      example: 123456789,
    }),
    thumbnailUrl: z.url().openapi({
      description: "URL to the thumbnail image for the comic series",
      example: "https://example.com/thumbnails/series123.jpg",
    }).optional(),
    metadata: MetadataSchema.optional(),
    comicBooks: z.array(ComicBookSchema).optional(),
  },
).openapi({
  title: "ComicSeries",
  description: "Schema representing a comic series",
});
