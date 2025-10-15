import { z } from "@hono/zod-openapi";
/**
 * Schema representing a comic series with its thumbnail URL.
 * 
 * This schema is used in responses where comic series data along with their
 * Based on the ComicSeries type from the schema definition with the addition of the thumbnailUrl field.
 */
export const comicSeriesWithThumbnailsSchema = z.object({
	id: z.number(),
	name: z.string(),
	description: z.string().nullable(),
	folderPath: z.string(),
	createdAt: z.string(),
	updatedAt: z.string(),
	thumbnailUrl: z.string().nullable(),
});