import { z } from "@hono/zod-openapi";
import camelcasekeys from "camelcase-keys";

import {
  comicSeriesSelectJoinedWithThubnailsMetadataAndComicsSchema,
  comicSeriesSelectJoinedWithThumbnailAndMetadataSchema,
  comicSeriesSelectJoinedWithThumbnailCamelCaseSchema,
} from "./data/comic-series.schema.ts";

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
    data: comicSeriesSelectJoinedWithThubnailsMetadataAndComicsSchema,
    message: z.string(),
  });

// CamelCase version for API responses - reuse base schema with key transformation
export const ComicSeriesWithComicsMetadataAndThumbnailsCamelCaseResponseSchema =
  ComicSeriesWithComicsMetadataAndThumbnailsResponseSchema
    .transform((data) => ({
      data: camelcasekeys(data.data, { deep: true }),
      message: data.message,
    }))
    .openapi({
      title: "ComicSeriesWithComicsMetadataAndThumbnailsCamelCaseResponse",
      description: "A camelCase response containing a comic series with its metadata, thumbnail, and associated comic books.",
      example: {
        data: {
          id: 1,
          name: "Example Series",
          description: "A comic series",
          folderPath: "/path/to/series",
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
          thumbnailUrl: "/api/image/thumbnail.jpg",
          metadata: {
            writers: "Writer Name",
            genres: "Action",
          },
          comics: [
            {
              id: 1,
              title: "Issue 1",
              issueNumber: "1",
            },
          ],
        },
        message: "Series retrieved successfully",
      },
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
