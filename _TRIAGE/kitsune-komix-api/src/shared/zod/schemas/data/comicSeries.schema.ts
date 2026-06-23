import { z } from "zod";

import {
  ComicSeriesSelectSchema,
} from "./database.schema.ts";
import { MetadataExpandedSchema } from "./comicMetadata.schema.ts";
import { ComicBookSchema } from "./comicBooks.schema.ts";

export const ComicSeriesMetaData = z.object({
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
  years: z.array(z.number()).openapi({
    description: "Years in which comics in the series were published",
    example: [1990, 1991, 1992],
  }).optional(),
  credits: MetadataExpandedSchema.optional(),
}).openapi({
  title: "ComicSeriesMetaData",
  description: "Metadata for a comic series, including total comic books, total size, and an optional thumbnail URL.",
});

/**
 * Schema for comic series, extending the base ComicSeriesSelectSchema with additional fields for thumbnail and metadata. This schema represents the structure of a comic series as it will be returned in API responses, including optional fields for a thumbnail image and associated metadata.
 */
export const ComicSeriesSchema = ComicSeriesSelectSchema.extend(
  ComicSeriesMetaData.shape
).openapi({
  title: "ComicSeries",
  description: "Schema representing a comic series",
});
