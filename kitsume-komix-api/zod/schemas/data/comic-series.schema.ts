import { z } from "@hono/zod-openapi";
import { comicBookSelectJoinedWithThumbnailSchema } from "./comic-books.schema.ts";

import { comicSeriesTable } from "../../../db/sqlite/schema.ts";
import { createSelectSchema } from "../../factory.ts";

export const comicSeriesSelectSchema: z.ZodObject = createSelectSchema(
  comicSeriesTable,
)
  .openapi("ComicSeriesSelectSchema");

export const comicSeriesSelectJoinedWithThumbnailSchema = createSelectSchema(
  comicSeriesTable,
)
  .extend({
    thumbnailUrl: z.string().nullable().optional(),
  })
  .openapi("ComicSeriesSelectJoinedWithThumbnailSchema");

export const comicSeriesSelectJoinedWithThumbnailAndMetadataSchema =
  comicSeriesSelectJoinedWithThumbnailSchema.extend({
    metadata: z.object({
      writers: z.string().nullable(),
      pencillers: z.string().nullable(),
      inkers: z.string().nullable(),
      colorists: z.string().nullable(),
      letterers: z.string().nullable(),
      editors: z.string().nullable(),
      coverArtists: z.string().nullable(),
      publishers: z.string().nullable(),
      imprints: z.string().nullable(),
      genres: z.string().nullable(),
      characters: z.string().nullable(),
      teams: z.string().nullable(),
      locations: z.string().nullable(),
      storyArcs: z.string().nullable(),
      seriesGroups: z.string().nullable(),
    }).or(z.record(z.string(), z.never())), // Allow either full metadata object or an empty object
  })
    .openapi("ComicSeriesSelectJoinedWithThumbnailAndMetadataSchema");

export const comicSeriesSelectJoinedWithThubnailsMetadataAndComicsSchema =
  comicSeriesSelectJoinedWithThumbnailAndMetadataSchema.extend({
    comics: z.array(
      comicBookSelectJoinedWithThumbnailSchema,
    ),
  })
    .openapi("ComicSeriesSelectJoinedWithThubnailsMetadataAndComicsSchema");

/**
 * Schema representing a comic series with its thumbnail URL.
 *
 * This schema is used in responses where comic series data along with their
 * Based on the ComicSeries type from the schema definition with the addition of the thumbnailUrl field.
 */
export const z_comicSeriesWithThumbnailsSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  folderPath: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  thumbnailUrl: z.string().nullable(),
});
