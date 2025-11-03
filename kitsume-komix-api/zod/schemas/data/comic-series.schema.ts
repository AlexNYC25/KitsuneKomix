import { z } from "@hono/zod-openapi";
import camelcasekeys from "camelcase-keys";
import { comicBookSelectJoinedWithThumbnailSchema } from "./comic-books.schema.ts";

import { comicSeriesTable } from "../../../db/sqlite/schema.ts";
import { createSelectSchema } from "../../factory.ts";

export const comicSeriesSelectSchema: z.ZodObject = createSelectSchema(
  comicSeriesTable,
).openapi({
	title: "ComicSeriesSelectSchema",
	description: "A schema representing a comic series with its basic fields.",
});

export const comicSeriesSelectJoinedWithThumbnailSchema = createSelectSchema(
  comicSeriesTable,
).extend({
    thumbnailUrl: z.string().nullable().optional(),
  })
  .openapi({
		title: "ComicSeriesSelectJoinedWithThumbnailSchema",
		description: "A schema representing a comic series with its thumbnail URL.",
	});

// CamelCase version for API responses - derived from base schema with key transformation
export const comicSeriesSelectJoinedWithThumbnailCamelCaseSchema =
  comicSeriesSelectJoinedWithThumbnailSchema
    .transform((data) => camelcasekeys(data, { deep: true }))
    .openapi({
      title: "ComicSeriesSelectJoinedWithThumbnailCamelCaseSchema",
      description: "A schema representing a comic series with its thumbnail URL (camelCase).",
    });

export const comicSeriesSelectJoinedWithThumbnailAndMetadataSchema =
  comicSeriesSelectJoinedWithThumbnailSchema.extend({
    metadata: z.union([
      z.object({
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
      }),
      z.record(z.string(), z.undefined()),
    ]),
  })
	.openapi({
		title: "ComicSeriesSelectJoinedWithThumbnailAndMetadataSchema",
		description: "A schema representing a comic series with its thumbnail URL and metadata.",
	});

export const comicSeriesSelectJoinedWithThubnailsMetadataAndComicsSchema =
  comicSeriesSelectJoinedWithThumbnailAndMetadataSchema.extend({
    comics: z.array(
      comicBookSelectJoinedWithThumbnailSchema,
    ),
  })
	.openapi({
		title: "ComicSeriesSelectJoinedWithThumbnailsMetadataAndComicsSchema",
		description: "A schema representing a comic series with its thumbnail URL, metadata, and associated comics.",
	});

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
