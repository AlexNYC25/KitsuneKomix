import { z } from "@hono/zod-openapi";
import { metadataUpdateSchema } from "./data/comicMetadata.schema.ts";

import { AuthRefreshToken } from "./data/auth.schema.ts";

/**
 * Common schema for path parameter 'id'
 *
 * Used in routes that require an 'id' parameter in the path.
 */
export const ParamIdSchema = z.object({
  id: z.string().openapi({
    param: { name: "id", in: "path" },
    example: "1",
  }),
});

/**
 * Schema specifically for use when request a specific page of a comic stream
 * 
 * Combines the 'id' and 'page' path parameters into a single schema.
 */
export const ParamIdStreamPageSchema = ParamIdSchema.extend({
  page: z.string().openapi({
    param: { name: "page", in: "path" },
    example: "1",
  }),
});

/**
 * Common schema for path parameter 'letter'
 *
 * Used in routes that require a 'letter' parameter in the path.
 */
export const ParamLetterSchema = z.object({
  letter: z.string().openapi({
    param: { name: "letter", in: "path" },
    example: "A",
  }),
});


/**
 * Common schema for pagination query parameters
 *
 * Used in routes that support pagination and as part of other pagination schemas.
 */
export const PaginationQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1).openapi({
    description: "Page number for pagination (default is 1)",
    example: 1,
  }),
  pageSize: z.coerce.number().min(1).max(100).default(20).openapi({
    description: "Number of items per page (default is 20, max is 100)",
    example: 20,
  })
});

/**
 * Common schema for sort query parameters
 * 
 * Used as part of pagination schemas for routes that support sorting.
 */
const SortQuerySchema = z.object({
  sort: z.string().optional().openapi({
    description: "The specific property to sort by",
    example: "created_at",
  }),
  sortDirection: z.enum(["asc", "desc"]).optional().openapi({
    description: "Sort direction",
    example: "desc",
  }),
});

/**
 * Common schema for filter query parameters
 * 
 * Used as part of pagination schemas for routes that support filtering.
 */
const FilterQuerySchema = z.object({
  filter: z.string().optional().openapi({
    description: "Filter value to search by",
    example: "Batman",
  }),
  filterProperty: z.string().optional().openapi({
    description: "Property used for filter",
    example: "authors",
  }),
});

/**
 * Common schema for pagination query parameters with sorting
 * 
 * Used in routes that support pagination and sorting.
 */
export const PaginationSortQuerySchema = PaginationQuerySchema.extend(SortQuerySchema.shape);


/**
 * Common schema for pagination query parameters with filtering
 * 
 * Used in routes that support pagination and filtering.
 */
export const PaginationFilterQuerySchema = PaginationQuerySchema.extend(FilterQuerySchema.shape);

/**
 * Common schema for pagination query parameters with letter filtering
 * 
 * Used in routes that support pagination and filtering by first letter.
 */
export const PaginationLetterQuerySchema = PaginationQuerySchema.extend(ParamLetterSchema.shape);

/**
 * Common schema for pagination query parameters with sorting and filtering
 *
 * Used in routes that support pagination, sorting, and filtering.
 * Combines pagination, sort, and filter parameters into a single schema.
 */
export const PaginationSortFilterQuerySchema = PaginationQuerySchema
	.extend(SortQuerySchema.shape)
	.extend(FilterQuerySchema.shape);

/**
 * Schema for comic metadata updates in request body
 * 
 * Used in routes that update comic metadata for single or multiple comic books.
 */
const ComicMetadataUpdateSchema = metadataUpdateSchema.array().openapi({
  title: "ComicMetadataUpdateArray",
  description: "Array of comic metadata updates",
});

/**
 * Schema for updating comic metadata for a single comic book
 * 
 * Used in routes that update metadata for a single comic book.
 */
export const ComicMetadataSingleUpdateSchema = z.object({
  metadataUpdates: ComicMetadataUpdateSchema,
  comicBookId: ParamIdSchema
}).openapi({
  title: "ComicMetadataSingleUpdate",
  description: "Schema for updating metadata for a single comic book",
});

/**
 * Schema for updating comic metadata for multiple comic books
 * 
 * Used in routes that update metadata for multiple comic books.
 */
export const ComicMetadataBulkUpdateSchema = z.object({
  metadataUpdates: ComicMetadataUpdateSchema,
  comicBookIds: z.array(ParamIdSchema).openapi({
    description: "Array of comic book IDs to update metadata for",
    example: ["1", "2", "3"],
  }),
}).openapi({
  title: "ComicMetadataBulkUpdate",
  description: "Schema for updating metadata for multiple comic books",
});

/**
 * Common schema for path parameters 'id' and 'thumbnailId'
 *
 * Used in routes that require both 'id' and 'thumbnailId' parameters in the path.
 */
export const ParamIdThumbnailIdSchema = ParamIdSchema.extend({
  thumbnailId: z.string().openapi({
    param: { name: "thumbnailId", in: "path" },
    example: "1",
  }),
});




// Schema for updating comic book partial fields in request body
export const ComicBookUpdateSchema = z.object({
  title: z.string().optional(),
  series: z.string().optional(),
  issue_number: z.number().optional(),
  volume: z.string().optional(),
  publisher: z.string().optional(),
  year: z.number().optional(),
  summary: z.string().optional(),
  authors: z.array(z.string()).optional(),
  genres: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  hash: z.string().optional(),
  page_count: z.number().optional(),
  review: z.string().optional(),
  age_rating: z.string().optional(),
  community_rating: z.number().min(0).max(5).optional(),
  file_size: z.number().optional(),
}).openapi({
  title: "ComicBookUpdate",
  description: "Partial comic book updates for PATCH/PUT requests",
});

// TODO: Check these if this can be replaced by existing schemas from the db table generated schemas
export const ComicLibrarySchema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().min(1).max(100),
  description: z.string().max(255).nullable().optional(),
  path: z.string().min(1).max(255),
  enabled: z.boolean(),
});

export const UserSchema = z.object({
  id: z.number().int().positive().optional(),
  username: z.string().min(3).max(30),
  email: z.email(),
  password: z.string().min(8).max(100),
  first_name: z.string().max(50).nullable().optional(),
  last_name: z.string().max(50).nullable().optional(),
});

/**
 * Schema for creating a custom thumbnail for a comic book
 * 
 * Expects a multipart form data request with:
 * - image: The image file (JPEG, PNG, WebP)
 * - name: Optional name for the thumbnail
 * - description: Optional description for the thumbnail
 */
export const CreateCustomThumbnailSchema = z.object({
  image: z.instanceof(File).openapi({
    description: "Image file for the custom thumbnail (JPEG, PNG, WebP)",
  }),
  name: z.string().optional().openapi({
    description: "Optional name for the custom thumbnail",
  }),
  description: z.string().optional().openapi({
    description: "Optional description for the custom thumbnail",
  }),
}).openapi({
  title: "CreateCustomThumbnail",
  description: "Multipart form data for creating a custom thumbnail",
});

/**
 * Schema for logging in a user
 */
export const LoginRequestSchema = z.object({
  email: z.email().openapi({ example: "user@example.com" }),
  password: z.string().min(6).openapi({ example: "password123" }),
}).openapi({
  title: "LoginRequest",
  description: "Request body for user login",
});

/**
 * Schema for refreshing access token using a refresh token
 */
export const RefreshTokenRequestSchema = z.object({
  refreshToken: AuthRefreshToken,
}).openapi({
  title: "RefreshTokenRequest",
  description: "Request body for refreshing access token",
});
