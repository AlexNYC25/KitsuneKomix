import { z } from "@hono/zod-openapi";
import { ComicBookWithThumbnailSchema } from "./comic-books.schema.ts";

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
 * 
 * NOTE: was previously used as the primary response schema for comic series details,
 * but has been superseded by comicSeriesWithComicsMetadataAndThumbnailsSchema.
 */
export const comicSeriesWithMetadataAndThumbnailsSchema = comicSeriesWithThumbnailsSchema.extend({
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
});

/**
 * Schema representing a comic series with its thumbnail URL, metadata, and associated comics with their thumbnails.
 * 
 * This schema is used in responses where comic series data along with their books and metadata are returned.
 * Based on the ComicSeries type from the schema definition with the addition of the thumbnailUrl field,
 * a metadata object that may be empty or contain full metadata information, and a comics object containing
 * the total number of comics and an array of comic books each with their own thumbnail URL.
 */
export const comicSeriesWithComicsMetadataAndThumbnailsSchema = comicSeriesWithMetadataAndThumbnailsSchema.extend({
	comics: z.object({
		total: z.number(),
		books: z.array(
			ComicBookWithThumbnailSchema
		),
	}),
});
