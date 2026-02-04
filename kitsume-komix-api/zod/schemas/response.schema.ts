import { z } from "@hono/zod-openapi";

import { metadataSchema } from "./data/comicMetadata.schema.ts";
import { comicBookSelectSchema, comicBookSelectJoinedWithThumbnailCamelCaseSchema, comicBookWithMetadataCamelCaseSchema } from "./data/comicBooks.schema.ts";
import { comicSeriesSelectJoinedWithThumbnailCamelCaseSchema } from "./data/comicSeries.schema.ts";
import { comicLibrariesArraySelectSchema } from "./data/comicLibraries.schema.ts";
import { comicBookThumbnailSchema } from "./data/comicThumbnails.schema.ts";
import { comicStoryArcSelectSchema } from "./data/comicStoryArcs.schema.ts";

// **** Basic response schemas **** //
/**
 * Schema for a simple message response
 */
export const MessageResponseSchema = z.object({
  message: z.string(),
}).openapi({
  title: "MessageResponse",
  description: "A response containing a message string",
});

/**
 * Schema for an error response with optional details
 */
export const ErrorResponseSchema = z.object({
  message: z.string(),
  errors: z.record(z.string(), z.any().openapi({ type: "object" })).optional(),
}).openapi({
  title: "ErrorResponse",
  description: "A response indicating an error with optional error details",
});

/**
 * Schema for a success response
 */
export const SuccessResponseSchema = z.object({
  success: z.boolean(),
}).openapi({
  title: "SuccessResponse",
  description: "A response indicating success or failure",
});

// Flexible schema for responses we don't want to type strictly in OpenAPI
/**
 * Schema for a flexible response structure, allowing any data shape
 */
export const FlexibleResponseSchema = z.unknown().openapi({
  title: "FlexibleResponse",
  description: "A flexible response schema for various data structures",
});

// **** Modular schemas **** //

/**
 * Schema for pagination metadata in responses
 */
export const PaginationMetaSchema = z.object({
  count: z.number().min(0),
  hasNextPage: z.boolean().default(false),
  currentPage: z.number().min(1),
  pageSize: z.number().min(1),
}).openapi({
  title: "PaginationMeta",
  description: "Metadata for paginated responses",
});

/**
 * Schema for filter metadata in responses
 */
export const FilterMetaSchema = z.object({
  filterProperty: z.string().nullable().optional(),
  filterValue: z.string().nullable().optional(),
}).openapi({
  title: "FilterMeta",
  description: "Metadata for filtered responses",
});

/**
 * Schema for sort metadata in responses
 */
export const SortMetaSchema = z.object({
  sortProperty: z.string(),
  sortOrder: z.enum(["asc", "desc"]),
}).openapi({
  title: "SortMeta",
  description: "Metadata for sorted responses",
});


/**
 * Schema for paginated comic series response
 */
export const ComicSeriesResponseSchema = z.object({
  data: z.array(
    comicSeriesSelectJoinedWithThumbnailCamelCaseSchema,
  ),
  meta: z.object({
    total: z.number().min(0),
    page: z.number().min(1),
    pageSize: z.number().min(1),
    hasNextPage: z.boolean().default(false),
  }),
  message: z.string(),
});

/**
 * Schema for returning multiple comic books as part of a response
 */
export const ComicBookMultipleResponseSchema = z.object({
  data: z.array(comicBookSelectSchema) || z.array(comicBookWithMetadataCamelCaseSchema),
}).openapi({
  title: "ComicBookMultipleResponse",
  description: "Response containing multiple comic books",
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