import { z } from "@hono/zod-openapi";

import { MetadataSchema } from "./data/comicMetadata.schema.ts";
import { ComicStoryArcSelectSchema, ComicLibrarySelectSchema, ComicBookThumbnailSelectSchema } from "./data/database.schema.ts";
import { ComicBookSchema } from "./data/comicBooks.schema.ts";
import { ComicSeriesSchema } from "./data/comicSeries.schema.ts";

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
const PaginationMetaSchema = z.object({
  count: z.number().min(0).default(0),
  hasNextPage: z.boolean().default(false),
  currentPage: z.number().min(1).default(1),
  pageSize: z.number().min(1).default(1),
}).openapi({
  title: "PaginationMeta",
  description: "Metadata for paginated responses",
});

/**
 * Schema for filter metadata in responses
 */
const FilterMetaSchema = z.object({
  filterProperty: z.string().optional(),
  filterValue: z.string().optional(),
}).openapi({
  title: "FilterMeta",
  description: "Metadata for filtered responses",
});

/**
 * Schema for sort metadata in responses
 */
const SortMetaSchema = z.object({
  sortProperty: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
}).openapi({
  title: "SortMeta",
  description: "Metadata for sorted responses",
});

/**
 * Schema for update results in bulk update responses
 */
const UpdatedResultsSchema = z.object({
  totalUpdated: z.number().min(0).default(0),
  totalRequested: z.number().min(0).default(0),
  successful: z.boolean().default(false),
}).openapi({
  title: "UpdatedResults",
  description: "Information about the results of an update operation",
});

// **** Full response schemas **** //

/**
 * Schema for paginated comic series response
 */
export const ComicSeriesResponseSchema = z.object({
  data: z.array(ComicSeriesSchema),
  meta: z.object(PaginationMetaSchema.shape).extend(FilterMetaSchema.shape).extend(SortMetaSchema.shape),
}).openapi({
  title: "ComicSeriesResponse",
  description: "Response containing paginated comic series data",
});

/**
 * Schema for returning multiple comic books as part of a response
 */
export const ComicBookMultipleResponseSchema = z.object({
  data: z.array(ComicBookSchema),
  meta: z.object(PaginationMetaSchema.shape).extend(FilterMetaSchema.shape).extend(SortMetaSchema.shape),
}).openapi({
  title: "ComicBookMultipleResponse",
  description: "Response containing multiple comic books",
});

/**
 * Schema for a comic book's thumbnails as part of a response
 */
export const ComicBookThumbnailsResponseSchema = z.object({
  thumbnails: z.array(ComicBookThumbnailSelectSchema),
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
 * Schema for bulk update response with results summary
 */
export const BulkUpdateResponseSchema = MessageResponseSchema.extend(UpdatedResultsSchema.shape).openapi({
  title: "BulkUpdateResponse",
  description: "Response for bulk update operations with results summary",
});


// ** HERE IS THE END OF THE VERIFED GOOD PART ** //


/**
 * Schema for library list response
 * Returns an array of comic libraries
 */
export const LibraryResponseSchema = z.object({
  message: z.string(),
  data: z.array(ComicLibrarySelectSchema),
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
  storyArcs: z.array(ComicStoryArcSelectSchema),
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