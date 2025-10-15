import { z } from "@hono/zod-openapi";

/**
 * Common schema for pagination query parameters
 * 
 * Used in routes that support pagination.
 */
export const PaginationQuerySchema = z.object({
	page: z.number().min(1).default(1).openapi({
		description: "Page number for pagination (default is 1)",
		example: 1,
	}),
	pageSize: z.number().min(1).max(100).default(20).openapi({
		description: "Number of items per page (default is 20, max is 100)",
		example: 20,
	}),
});

/**
 * Common schema for path parameter 'id'
 * 
 * Used in routes that require an 'id' parameter in the path.
 */
export const ParamIdSchema = z.object({
  id: z.string().openapi({
    param: { name: 'id', in: 'path' },
    example: '1',
  }),
});

/**
 * Common schema for path parameter 'letter'
 * 
 * Used in routes that require a 'letter' parameter in the path.
 */
export const ParamLetterSchema = z.object({
  letter: z.string().openapi({
    param: { name: 'letter', in: 'path' },
    example: 'A',
  }),
});

/** 
 * Common schema for path parameters 'id' and 'thumbnailId'
 * 
 * Used in routes that require both 'id' and 'thumbnailId' parameters in the path.
 */
export const ParamIdThumbnailIdSchema = z.object({
  id: z.string().openapi({
    param: { name: 'id', in: 'path' },
    example: '1',
  }),
  thumbnailId: z.string().openapi({
    param: { name: 'thumbnailId', in: 'path' },
    example: '1',
  }),
});