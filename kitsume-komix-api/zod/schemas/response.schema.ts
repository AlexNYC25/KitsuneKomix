import { z } from "@hono/zod-openapi";

import {
  comicSeriesSelectJoinedWithThumbnailsMetadataAndComicsSchema,
  comicSeriesSelectJoinedWithThumbnailAndMetadataSchema,
  comicSeriesSelectJoinedWithThumbnailCamelCaseSchema,
} from "./data/comic-series.schema.ts";
import { comicBookSelectJoinedWithThumbnailCamelCaseSchema } from "./data/comic-books.schema.ts";

export const MessageResponseSchema = z.object({
  message: z.string(),
});

export const ErrorResponseSchema = z.object({
  message: z.string(),
  errors: z.record(z.string(), z.any().openapi({ type: "object" })).optional(),
});

export const ComicSeriesResponseSchema = z.object({
  data: z.array(
    comicSeriesSelectJoinedWithThumbnailCamelCaseSchema,
  ),
  meta: z.object({
    total: z.number(),
    page: z.number(),
    pageSize: z.number(),
    hasNextPage: z.boolean(),
  }),
  message: z.string(),
});

export const ComicSeriesWithMetadataAndThumbnailsResponseSchema = z.object({
  data: comicSeriesSelectJoinedWithThumbnailAndMetadataSchema,
  message: z.string(),
});

export const ComicSeriesWithComicsMetadataAndThumbnailsResponseSchema = z
  .object({
    data: comicSeriesSelectJoinedWithThumbnailsMetadataAndComicsSchema,
    message: z.string(),
  });

// CamelCase version for API responses - explicitly defined schema for OpenAPI compatibility
export const ComicSeriesWithComicsMetadataAndThumbnailsCamelCaseResponseSchema = z.object({
  message: z.string().openapi({ example: "Series retrieved successfully" }),
  data: z.object({
    id: z.number().openapi({ example: 1 }),
    name: z.string().openapi({ example: "Example Series" }),
    description: z.string().nullable().openapi({ example: "A comic series" }),
    folderPath: z.string().openapi({ example: "/path/to/series" }),
    createdAt: z.string().openapi({ example: "2024-01-01T00:00:00Z" }),
    updatedAt: z.string().openapi({ example: "2024-01-01T00:00:00Z" }),
    thumbnailUrl: z.string().nullable().optional().openapi({ example: "/api/image/thumbnail.jpg" }),
    metadata: z.object({
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
    }).optional().openapi({
      title: "ComicSeriesMetadata",
      description: "Metadata for a comic series",
    }),
    comics: z.array(comicBookSelectJoinedWithThumbnailCamelCaseSchema).openapi({
      description: "Array of comic books in this series",
    }),
  }).openapi({
    title: "ComicSeriesWithComicsMetadataAndThumbnailsData",
    description: "The data object containing series details",
  }),
}).openapi({
  title: "ComicSeriesWithComicsMetadataAndThumbnailsCamelCaseResponse",
  description: "A camelCase response containing a comic series with its metadata, thumbnail, and associated comic books.",
});

const librarySchema = z.object({
  id: z.number(),
  name: z.string().min(1).max(255),
  path: z.string().min(1).max(1024),
  description: z.string().max(1024).nullable(),
  enabled: z.boolean(),
  changed_at: z.string().datetime().openapi({ type: "string", format: "date-time" }),
  created_at: z.string().datetime().openapi({ type: "string", format: "date-time" }),
  updated_at: z.string().datetime().openapi({ type: "string", format: "date-time" }),
});

const librariesSchema = z.array(librarySchema);

export const LibraryResponseSchema = z.object({
  message: z.string(),
  data: z.union([librariesSchema, librarySchema]).optional(),
});
