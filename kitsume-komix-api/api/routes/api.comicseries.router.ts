import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import camelcasekeys from "camelcase-keys";

import { requireAuth } from "../middleware/authChecks.ts";

import {
  fetchComicSeries,
  getLatestComicSeriesUserCanAccess,
  getSelectedComicSeriesDetails,
  getUpdatedComicSeriesUserCanAccess,
} from "../services/comicSeries.service.ts";


import { AuthHeaderSchema } from "#schemas/header.schema.ts";
import {
  ComicSeriesSchema,
} from "#schemas/data/comicSeries.schema.ts";
import {
  ParamIdThumbnailIdSchema,
  PaginationSortFilterQuerySchema,
  ParamIdSchema,
  ParamLetterSchema,
} from "#schemas/request.schema.ts";
import {
  ComicSeriesMultipleResponseSchema,
  MessageResponseSchema,
} from "#schemas/response.schema.ts";

import type { 
  AppEnv,
  AccessRefreshTokenCombinedPayload,
  QueryData,
  RequestParametersValidated,
  ComicSeriesSortField,
  ComicSeriesFilterField,
  ComicSeriesWithMetadata,
} from "#types/index.ts";
import { validateAndBuildQueryParams } from "#utilities/parameters.ts";

const app = new OpenAPIHono<AppEnv>();

app.openAPIRegistry.registerComponent("securitySchemes", "Bearer", {
  type: "http",
  scheme: "bearer",
});

/**
 * GET /api/comic-series/
 *
 * Basic route to get all comic series.
 */
app.openapi(
  createRoute({
    method: "get",
    path: "/",
    summary: "Get all comic series",
    description: "Retrieve all comic series from the database",
    tags: ["Comic Series"],
    middleware: [requireAuth],
    request: {
      query: PaginationSortFilterQuerySchema,
    },
    responses: {
      200: {
        content: { 
          "application/json": { 
            schema: z.any() // TODO: Define a proper response schema for this endpoint
          }
        },
        description: "Series retrieved successfully",
      },
      400: {
        content: { 
          "application/json": { 
            schema: MessageResponseSchema 
          }
        },
        description: "Bad Request",
      },
      401: {
        content: { 
          "application/json": { 
            schema: MessageResponseSchema 
          }
        },
        description: "Unauthorized",
      },
      500: {
        content: { 
          "application/json": 
            { 
              schema: MessageResponseSchema 
            } 
        },
        description: "Internal Server Error",
      },
    },
  }),
  async (c) => {
    const queryData: QueryData = c.req.valid("query");

    const user: AccessRefreshTokenCombinedPayload | undefined = c.get("user");

    if (!user || !user.sub) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const userId: number = parseInt(user.sub, 10);
    if (isNaN(userId)) {
      return c.json({ message: "Invalid user ID" }, 400);
    }

    const serviceData: RequestParametersValidated<ComicSeriesSortField, ComicSeriesFilterField> = validateAndBuildQueryParams(queryData, "comicSeries");

    try {
      const comicSeries: ComicSeriesWithMetadata[] = await fetchComicSeries(serviceData);
      return c.json(comicSeries, 200);
    } catch (error) {
      console.error("Error fetching comic series:", error);
      return c.json({ message: "Internal Server Error" }, 500);
    }
  },
);

/**
 * GET /api/comic-series/latest
 *
 * Get the latest comic series that the current user has access to.
 * Admins can see all series, regular users only those they have been granted access to.
 * Results are always sorted by creation date in descending order.
 */
app.openapi(
  createRoute({
    method: "get",
    path: "/latest",
    summary: "Get latest comic series",
    tags: ["Comic Series"],
    middleware: [requireAuth],
    request: { 
      headers: AuthHeaderSchema, 
      query: PaginationSortFilterQuerySchema 
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: z.any() // TODO: Define a proper response schema for this endpoint,
          },
        },
        description: "Latest series retrieved successfully",
      },
      400: {
        content: { "application/json": { schema: MessageResponseSchema } },
        description: "Bad Request",
      },
      401: {
        content: { "application/json": { schema: MessageResponseSchema } },
        description: "Unauthorized",
      },
      500: {
        content: { "application/json": { schema: MessageResponseSchema } },
        description: "Internal Server Error",
      },
    },
  }),
  async (c) => {
    const user: AccessRefreshTokenCombinedPayload | undefined = c.get("user");
    if (!user || !user.sub) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const userId: number = parseInt(user.sub, 10);
    if (isNaN(userId)) {
      return c.json({ message: "Invalid user ID" }, 400);
    }

    const queryData: QueryData = c.req.valid("query");

    // Override sort to always be by createdAt in descending order
    queryData.sort = "createdAt";
    queryData.sortDirection = "desc";

    const serviceData: RequestParametersValidated<ComicSeriesSortField, ComicSeriesFilterField> = validateAndBuildQueryParams(queryData, "comicSeries");

    try {
      const comicSeries: ComicSeriesWithMetadata[] = await fetchComicSeries(serviceData);
      return c.json(comicSeries, 200);
    } catch (error) {
      console.error("Error fetching latest comic series:", error);
      return c.json({ message: "Internal Server Error" }, 500);
    }
  },
);

/**
 * GET /api/comic-series/updated
 */
app.openapi(
  createRoute({
    method: "get",
    path: "/updated",
    summary: "Get updated comic series",
    tags: ["Comic Series"],
    middleware: [requireAuth],
    request: { headers: AuthHeaderSchema, query: PaginationSortFilterQuerySchema },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: z.any() // TODO: Define a proper response schema for this endpoint,
          },
        },
        description: "Latest series retrieved successfully",
      },
      400: {
        content: { "application/json": { schema: MessageResponseSchema } },
        description: "Bad Request",
      },
      401: {
        content: { "application/json": { schema: MessageResponseSchema } },
        description: "Unauthorized",
      },
      500: {
        content: { "application/json": { schema: MessageResponseSchema } },
        description: "Internal Server Error",
      },
    },
  }),
  async (c) => {
    const user: AccessRefreshTokenCombinedPayload | undefined = c.get("user");
    if (!user || !user.sub) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const userId: number = parseInt(user.sub, 10);
    if (isNaN(userId)) {
      return c.json({ message: "Invalid user ID" }, 400);
    }

    const queryData: QueryData = c.req.valid("query");

    // Override sort to always be by updatedAt in descending order
    queryData.sort = "updatedAt";
    queryData.sortDirection = "desc";

    const serviceData: RequestParametersValidated<ComicSeriesSortField, ComicSeriesFilterField> = validateAndBuildQueryParams(queryData, "comicSeries");

    try {
      const comicSeries: ComicSeriesWithMetadata[] = await fetchComicSeries(serviceData);
      return c.json(comicSeries, 200);
    } catch (error) {
      console.error("Error fetching updated comic series:", error);
      return c.json({ message: "Internal Server Error" }, 500);
    }
  },
);

/**
 * GET /api/comic-series/{id}
 *
 * Get a comic series by ID.
 */
app.openapi(
  createRoute({
    method: "get",
    path: "/{id}",
    summary: "Get a comic series by ID",
    tags: ["Comic Series"],
    middleware: [requireAuth],
    request: { 
      params: ParamIdSchema,
      query: PaginationSortFilterQuerySchema,
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: z.any() // TODO: Define a proper response schema for this endpoint,
          },
        },
        description: "Series retrieved successfully",
      },
      400: {
        content: { "application/json": { schema: MessageResponseSchema } },
        description: "Bad Request",
      },
      401: {
        content: { "application/json": { schema: MessageResponseSchema } },
        description: "Unauthorized",
      },
      404: {
        content: { "application/json": { schema: MessageResponseSchema } },
        description: "Not Found",
      },
      500: {
        content: { "application/json": { schema: MessageResponseSchema } },
        description: "Internal Server Error",
      },
    },
  }),
  async (c) => {
    const user: AccessRefreshTokenCombinedPayload | undefined = c.get("user");
    if (!user || !user.sub) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const userId: number = parseInt(user.sub, 10);
    if (isNaN(userId)) {
      return c.json({ message: "Invalid user ID" }, 400);
    }

    const { id } = c.req.valid("param");
    if (!id) {
      return c.json({ message: "Invalid series ID" }, 400);
    }

    const queryData: QueryData = c.req.valid("query");

    // Override to filter by ID, sort by ID, and limit to 1 result
    queryData.filter = id;
    queryData.filterProperty = "id";
    queryData.sort = "id";
    queryData.sortDirection = "asc";
    queryData.pageSize = 1;

    const serviceData: RequestParametersValidated<ComicSeriesSortField, ComicSeriesFilterField> = validateAndBuildQueryParams(queryData, "comicSeries");

    try {
      const comicSeries: ComicSeriesWithMetadata[] = await fetchComicSeries(serviceData);
      if (!comicSeries || comicSeries.length === 0) {
        return c.json({ message: "Comic series not found" }, 404);
      }

      return c.json(comicSeries[0], 200);
    } catch (error) {
      console.error("Error fetching comic series:", error);
      return c.json({ message: "Internal Server Error" }, 500);
    }
  },
);

// Get series thumbnails
app.openapi(
  createRoute({
    method: "get",
    path: "/{id}/thumbnails",
    summary: "Get series thumbnails",
    tags: ["Comic Series"],
    request: { params: ParamIdSchema },
    responses: {
      200: {
        content: { "application/json": { schema: MessageResponseSchema } },
        description: "Thumbnails retrieved successfully",
      },
    },
  }),
  (c) => {
    const { id } = c.req.valid("param");
    return c.json({
      message: `Comic Series API is running for ID ${id} - Thumbnails`,
    }, 200);
  }
);

// Create series thumbnail
app.openapi(
  createRoute({
    method: "post",
    path: "/{id}/thumbnail",
    summary: "Create series thumbnail",
    tags: ["Comic Series"],
    request: { params: ParamIdSchema },
    responses: {
      200: {
        content: { "application/json": { schema: MessageResponseSchema } },
        description: "Thumbnail created successfully",
      },
    },
  }),
  (c) => {
    const { id } = c.req.valid("param");
    return c.json({
      message: `Comic Series API is running for ID ${id} - Thumbnail Creation`,
    }, 200);
  }
);

// Delete series thumbnail
app.openapi(
  createRoute({
    method: "delete",
    path: "/{id}/thumbnail/{thumbId}",
    summary: "Delete series thumbnail",
    tags: ["Comic Series"],
    request: { params: ParamIdThumbnailIdSchema },
    responses: {
      200: {
        content: { "application/json": { schema: MessageResponseSchema } },
        description: "Thumbnail deleted successfully",
      },
    },
  }),
  (c) => {
    const { id } = c.req.valid("param");
    return c.json({
      message: `Comic Series API is running for ID ${id} - Thumbnail Deletion`,
    }, 200);
  }
);

// Get specific thumbnail
app.openapi(
  createRoute({
    method: "get",
    path: "/{id}/thumbnails/{thumbId}",
    summary: "Get specific thumbnail",
    tags: ["Comic Series"],
    request: { params: ParamIdThumbnailIdSchema },
    responses: {
      200: {
        content: { "application/json": { schema: MessageResponseSchema } },
        description: "Thumbnail retrieved successfully",
      },
    },
  }),
  (c) => {
    const { id } = c.req.valid("param");
    return c.json({
      message: `Comic Series API is running for ID ${id} - Thumbnail Retrieval`,
    }, 200);
  }
);

// Update thumbnail cover
app.openapi(
  createRoute({
    method: "put",
    path: "/{id}/thumbnail/{thumbId}/cover",
    summary: "Update thumbnail cover",
    tags: ["Comic Series"],
    request: { params: ParamIdThumbnailIdSchema },
    responses: {
      200: {
        content: { "application/json": { schema: MessageResponseSchema } },
        description: "Thumbnail cover updated successfully",
      },
    },
  }),
  (c) => {
    const { id } = c.req.valid("param");
    return c.json({
      message:
        `Comic Series API is running for ID ${id} - Thumbnail Cover Update`,
    }, 200);
  }
);

// Get alphabetical series
app.openapi(
  createRoute({
    method: "get",
    path: "/alphabetical",
    summary: "Get series alphabetically",
    tags: ["Comic Series"],
    responses: {
      200: {
        content: { "application/json": { schema: MessageResponseSchema } },
        description: "Alphabetical series retrieved successfully",
      },
    },
  }),
  (_c) => {
    return _c.json({ message: "Alphabetical Comic Series API is running" }, 200);
  }
);

// Get series by letter
app.openapi(
  createRoute({
    method: "get",
    path: "/alphabetical/{letter}",
    summary: "Get series by starting letter",
    tags: ["Comic Series"],
    request: { params: ParamLetterSchema },
    responses: {
      200: {
        content: { "application/json": { schema: MessageResponseSchema } },
        description: "Series retrieved successfully",
      },
    },
  }),
  (c) => {
    const { letter } = c.req.valid("param");
    return c.json({
      message: `Alphabetical Comic Series API is running for letter ${letter}`,
    }, 200);
  }
);

export default app;
