import { z } from "@hono/zod-openapi";

import { comicSeriesWithThumbnailsSchema } from "./data/comic-series.schema.ts";

export const MessageResponseSchema = z.object({
  message: z.string(),
});

export const ErrorResponseSchema = z.object({
  message: z.string(),
  errors: z.record(z.string(), z.any()).optional(),
});

export const ComicSeriesResponseSchema = z.object({
  data: z.array(
    comicSeriesWithThumbnailsSchema
  ),
  meta: z.object({
    total: z.number(),
    page: z.number(),
    pageSize: z.number(),
    hasNextPage: z.boolean(),
  }),
  message: z.string(),
});

const librarySchema = z.object({
	id: z.number(),
	name: z.string().min(1).max(255),
	path: z.string().min(1).max(1024),
	description: z.string().max(1024).nullable(),
	enabled: z.boolean(),
	changed_at: z.date(),
	created_at: z.date(),
	updated_at: z.date(),
});

const librariesSchema = z.array(librarySchema);

export const LibraryResponseSchema = z.object({
  message: z.string(),
  data: librariesSchema.optional().or(librarySchema.optional()),
});

