import { z } from "@hono/zod-openapi";

/**
 * Schema representing a comic book.
 * 
 * Based on the ComicBook type from the schema definition.
 */
export const comicBookSchema = z.object({
	id: z.number(),
	libraryId: z.number(),
	filePath: z.string(),
	hash: z.string(),
	title: z.string().nullable(),
	series: z.string().nullable(),
	issueNumber: z.string().nullable(),
	count: z.number().nullable(),
	volume: z.string().nullable(),
	alternateSeries: z.string().nullable(),
	alternateIssueNumber: z.string().nullable(),
	alternateCount: z.number().nullable(),
	pageCount: z.number().nullable(),
	fileSize: z.number().nullable(),
	summary: z.string().nullable(),
	notes: z.string().nullable(),
	year: z.number().nullable(),
	month: z.number().nullable(),
	day: z.number().nullable(),
	publisher: z.string().nullable(),
	publicationDate: z.string().nullable(),
	scanInfo: z.string().nullable(),
	language: z.string().nullable(),
	format: z.string().nullable(),
	blackAndWhite: z.number().nullable(),
	manga: z.number().nullable(),
	readingDirection: z.string().nullable(),
	review: z.string().nullable(),
	ageRating: z.string().nullable(),
	communityRating: z.number().nullable(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

/**
 * Schema representing a comic book with its thumbnail URL.
 * 
 * This schema is used in responses where comic book data along with their
 * thumbnail URL is required.
 * Based on the ComicBook type from the schema definition with the addition of the thumbnailUrl field.
 */
export const ComicBookWithThumbnailSchema = comicBookSchema.extend({
	thumbnailUrl: z.string().nullable(),
});
