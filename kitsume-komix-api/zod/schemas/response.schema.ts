import { z } from "@hono/zod-openapi";

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

export const ErrorResponseSchema = z.object({
  message: z.string(),
  errors: z.record(z.string(), z.any()).optional(),
});