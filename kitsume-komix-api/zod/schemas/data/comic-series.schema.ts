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

/**
 * Schema representing a comic series with its thumbnail URL and metadata.
 * 
 * This schema is used in responses where comic series data along with their
 * Based on the ComicSeries type from the schema definition with the addition of the thumbnailUrl field
 * and a metadata object that may be empty or contain full metadata information.
 */
export const comicSeriesWithMetadataAndThumbnailsSchema = comicSeriesWithThumbnailsSchema.extend({
	metadata: z.object({
		writers: z.string().nullable(),
		pencillers: z.string().nullable(),
		inkers: z.string().nullable(),
		colorists: z.string().nullable(),
		letterers: z.string().nullable(),
		editors: z.string().nullable(),
		cover_artists: z.string().nullable(),
		publishers: z.string().nullable(),
		imprints: z.string().nullable(),
		genres: z.string().nullable(),
		characters: z.string().nullable(),
		teams: z.string().nullable(),
		locations: z.string().nullable(),
		story_arcs: z.string().nullable(),
		series_groups: z.string().nullable(),
	}).or(z.record(z.string(), z.never())), // Allow either full metadata object or an empty object
});