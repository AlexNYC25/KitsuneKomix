import { z } from "@hono/zod-openapi";

/**
 * Common schema for pagination query parameters
 *
 * Used in routes that support pagination.
 */
export const PaginationQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1).openapi({
    description: "Page number for pagination (default is 1)",
    example: 1,
  }),
  pageSize: z.coerce.number().min(1).max(100).default(20).openapi({
    description: "Number of items per page (default is 20, max is 100)",
    example: 20,
  }),
  sort: z.string().optional().openapi({
    description: "The specific property to sort by",
    example: "created_at",
  }),
  sortDirection: z.enum(["asc", "desc"]).optional().openapi({
    description: "Sort direction",
    example: "desc",
  }),
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
 * Pagination query schema without sortProperty
 *
 * Used in routes that support pagination but not sorting, such as routes that explicitly describe their own sorting behavior.
 * For example, search routes that sort by latest added or date
 */
export const PaginationQuerySchemaWithoutSortProperty = PaginationQuerySchema.omit({
  sort: true,
});

export const PaginationQueryNoFilterSchema = PaginationQuerySchema.omit({
  filter: true,
  filterProperty: true,
});

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
 * Common schema for path parameters 'id' and 'thumbnailId'
 *
 * Used in routes that require both 'id' and 'thumbnailId' parameters in the path.
 */
export const ParamIdThumbnailIdSchema = z.object({
  id: z.string().openapi({
    param: { name: "id", in: "path" },
    example: "1",
  }),
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