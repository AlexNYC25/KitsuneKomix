import { z } from "@hono/zod-openapi";

import { metadataSchema } from "./data/comic-metadata.schema.ts";
import { comicBookSelectJoinedWithThumbnailCamelCaseSchema, comicBookWithMetadataCamelCaseSchema } from "./data/comic-books.schema.ts";
import { comicSeriesSelectJoinedWithThumbnailCamelCaseSchema } from "./data/comic-series.schema.ts";
import { comicLibrariesArraySelectSchema } from "./data/comic-libraries.schema.ts";
import { comicBookThumbnailSchema } from "./data/comic-thumbnails.schema.ts";
import { comicStoryArcSelectSchema } from "./data/comic-story-arcs.schema.ts";

// **** Basic response schemas **** //
export const MessageResponseSchema = z.object({
  message: z.string(),
});

export const ErrorResponseSchema = z.object({
  message: z.string(),
  errors: z.record(z.string(), z.any().openapi({ type: "object" })).optional(),
});

export const SuccessResponseSchema = z.object({
  success: z.boolean(),
});

// Flexible schema for responses we don't want to type strictly in OpenAPI
export const FlexibleResponseSchema = z.unknown();

/**
 * Schema for paginated comic series response
 */
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


// ** HERE IS THE END OF THE VERIFED GOOD PART ** //


/**
 * Schema for the comic book's thumbnails response, as a standalone response
 */
export const ComicBookThumbnailsResponseSchema = z.object({
  thumbnails: z.array(comicBookThumbnailSchema),
  message: z.string(),
}).openapi({
  title: "ComicBookThumbnailsResponse",
  description: "Response containing an array of comic book thumbnails",
});

/**
 * Schema for comic book read by user response
 */
export const ComicBookReadByUserResponseSchema = z.object({
  id: z.number(),
  read: z.boolean(),
}).openapi({
  title: "ComicBookReadByUserResponse",
  description: "Response indicating if a comic book has been read by the user",
});

/**
 * Schema for single comic book metadata response
 * Used for GET /api/comic-books/:id/metadata endpoint
 */
export const ComicBookMetadataResponseSchema = comicBookWithMetadataCamelCaseSchema.catchall(z.any()).openapi({
  title: "ComicBookMetadataResponse",
  description: "A single comic book with its full metadata including all related creator and content information",
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
    metadata: metadataSchema.optional().openapi({
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

/**
 * Schema for library list response
 * Returns an array of comic libraries
 */
export const LibraryResponseSchema = z.object({
  message: z.string(),
  data: comicLibrariesArraySelectSchema,
}).openapi({
  title: "LibraryListResponse",
  description: "Response containing a message and array of comic library data",
});

/**
 * Schema for create library response
 * Returns the ID of the newly created library
 */
export const CreateLibraryResponseSchema = z.object({
  message: z.string(),
  libraryId: z.number(),
}).openapi({
  title: "CreateLibraryResponse",
  description: "Response containing a message and the ID of the newly created library",
});

export const ComicArcResponseSchema = z.object({
  storyArcs: z.array(comicStoryArcSelectSchema),
  hasNextPage: z.boolean(),
  currentPage: z.number(),
  pageSize: z.number(),
  totalResults: z.number(),
  isFiltered: z.boolean(),
  isSorted: z.boolean(),
}).openapi({
  title: "ComicArcResponse",
  description: "Response containing comic story arcs with pagination info",
});