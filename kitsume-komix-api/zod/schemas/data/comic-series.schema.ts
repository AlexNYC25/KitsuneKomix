import { z } from "@hono/zod-openapi";
import { createSelectSchema } from "drizzle-zod";
import camelcasekeys from "camelcase-keys";
import { 
  comicBookSelectJoinedWithThumbnailSchema,
  comicBookSelectJoinedWithThumbnailCamelCaseSchema 
} from "./comic-books.schema.ts";
import { toCamelCaseSchema } from "../../utils/openapi-helpers.ts";

import { comicSeriesTable } from "../../../db/sqlite/schema.ts";

export const comicSeriesSelectSchema: z.ZodObject = createSelectSchema(
  comicSeriesTable,
);

export const comicSeriesSelectJoinedWithThumbnailSchema = createSelectSchema(
  comicSeriesTable,
).extend({
  thumbnailUrl: z.string().nullable().optional(),
});

// Use helper to convert to camelCase (no .transform(), fully OpenAPI compatible)
export const comicSeriesSelectJoinedWithThumbnailCamelCaseSchema = toCamelCaseSchema(
  comicSeriesSelectJoinedWithThumbnailSchema,
  {
    title: "ComicSeriesWithThumbnail",
    description: "A comic series with its thumbnail URL in camelCase format",
  }
);

// Runtime transformer (for actual data transformation, not OpenAPI)
export const comicSeriesSelectJoinedWithThumbnailTransform =
  comicSeriesSelectJoinedWithThumbnailSchema
    .transform((data) => camelcasekeys(data, { deep: true }));

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
  });

export const comicSeriesSelectJoinedWithThubnailsMetadataAndComicsSchema =
  comicSeriesSelectJoinedWithThumbnailAndMetadataSchema.extend({
    comics: z.array(
      comicBookSelectJoinedWithThumbnailSchema,
    ),
  });

// Metadata schema for OpenAPI
const metadataSchema = z.object({
  writers: z.string().nullable().optional(),
  pencillers: z.string().nullable().optional(),
  inkers: z.string().nullable().optional(),
  colorists: z.string().nullable().optional(),
  letterers: z.string().nullable().optional(),
  editors: z.string().nullable().optional(),
  coverArtists: z.string().nullable().optional(),
  publishers: z.string().nullable().optional(),
  imprints: z.string().nullable().optional(),
  genres: z.string().nullable().optional(),
  characters: z.string().nullable().optional(),
  teams: z.string().nullable().optional(),
  locations: z.string().nullable().optional(),
  storyArcs: z.string().nullable().optional(),
  seriesGroups: z.string().nullable().optional(),
}).openapi({
  title: "ComicSeriesMetadata",
  description: "Metadata for a comic series",
});

// Explicit camelCase schema for series with comics, metadata, and thumbnails for OpenAPI compatibility
export const comicSeriesSelectJoinedWithThubnailsMetadataAndComicsCamelCaseSchema = z.object({
  id: z.number().openapi({ example: 1 }),
  name: z.string().openapi({ example: "Example Series" }),
  description: z.string().nullable().openapi({ example: "A comic series" }),
  folderPath: z.string().openapi({ example: "/path/to/series" }),
  createdAt: z.string().openapi({ example: "2024-01-01T00:00:00Z" }),
  updatedAt: z.string().openapi({ example: "2024-01-01T00:00:00Z" }),
  thumbnailUrl: z.string().nullable().optional().openapi({ example: "/api/image/thumbnail.jpg" }),
  metadata: metadataSchema.optional(),
  comics: z.array(comicBookSelectJoinedWithThumbnailCamelCaseSchema).openapi({
    description: "Array of comic books in this series",
  }),
}).openapi({
  title: "ComicSeriesWithComicsMetadataAndThumbnails",
  description: "A comic series with its metadata, thumbnail, and associated comic books in camelCase format",
});
