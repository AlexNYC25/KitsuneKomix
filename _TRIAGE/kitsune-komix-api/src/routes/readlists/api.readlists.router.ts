import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { z } from "zod"

import { requireAuth } from "#modules/auth/middleware/authChecks.ts";

import { fetchComicStoryArcs } from "#modules/readlists/comic-story-arcs.service.ts";

import {
  ComicStoryArcMultipleResponseSchema,
  ErrorResponseSchema,
  MessageResponseSchema,
  ReadlistsResponseSchema,
} from "#zod/schemas/response.schema.ts";
import {
  AddReadlistSchema,
  PaginationSortMultiFilterComicQuerySchema,
  PaginationSortFilterQuerySchema,
  ParamComicBookIdSchema,
  ParamIdSchema,
} from "#zod/schemas/request.schema.ts";

import type {
  AppEnv,
  QueryData,
  QueryDataMultiFilter,
  ComicReadlistsSortField,
  ComicReadlistsFilterField,
  RequestParametersValidated,
  ComicStoryArcWithComicBooks
} from "#types/index.ts";

import { validateAndBuildQueryParams, VALIDATE_COMIC_READLISTS_KEY } from "#utilities/parameters.ts";

const app = new OpenAPIHono<AppEnv>();

// Register Bearer Auth security scheme for OpenAPI
app.openAPIRegistry.registerComponent("securitySchemes", "Bearer", {
  type: "http",
  scheme: "bearer",
});

/**
 * GET /api/readlists/
 *
 * Get all readlists for the current user.
 */
app.openapi(
  createRoute({
    method: "get",
    path: "/",
    summary: "Get all readlists",
    tags: ["Readlists"],
    middleware: [requireAuth],
    request: {
      query: PaginationSortMultiFilterComicQuerySchema,
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: ReadlistsResponseSchema,
          },
        },
        description: "Readlists retrieved successfully",
      },
      400: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Invalid request parameters",
      },
      401: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Unauthorized",
      },
      500: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Internal Server Error",
      },
    },
  }),
  async (c) => {
    const queryData: QueryDataMultiFilter = c.req.valid("query");
    const userId: number = c.get("userId")!;

    const serviceData: RequestParametersValidated< ComicReadlistsSortField, ComicReadlistsFilterField > = validateAndBuildQueryParams(queryData, VALIDATE_COMIC_READLISTS_KEY);

    try {
      const readlists: ComicStoryArcWithComicBooks[] = await fetchComicStoryArcs(serviceData, userId);

      return c.json({
        data: readlists,
        meta: {
          count: readlists.length,
          hasNextPage: false,
          currentPage: 1,
          pageSize: 9999
        },
      }, 200);
    } catch (error) {
      console.error("Error fetching readlists:", error);
      return c.json(
        { message: "Error fetching readlists", error: String(error) },
        500,
      );
    }
  },
);

/**
 * GET /api/readlists/{id}
 *
 * Get a specific readlist by ID.
 */
app.openapi(
  createRoute({
    method: "get",
    path: "/{id}",
    summary: "Get a readlist by ID",
    tags: ["Readlists"],
    middleware: [requireAuth],
    request: { params: ParamIdSchema },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: z.object({ id: z.string(), name: z.string() }),
          },
        },
        description: "Readlist retrieved successfully",
      },
      400: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Invalid readlist ID",
      },
      401: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Unauthorized",
      },
      500: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Internal Server Error",
      },
    },
  }),
  (c) => {
    const { id } = c.req.valid("param");

    const userId = c.get("userId")!;

    //TODO: implement readlist retrieval logic
    const readlist = { id, name: "Default Readlist" };
    return c.json(readlist, 200);
  },
);

/**
 * DELETE /api/readlists/{id}
 *
 * Delete a specific readlist by ID.
 */
app.openapi(
  createRoute({
    method: "delete",
    path: "/{id}",
    summary: "Delete a readlist",
    tags: ["Readlists"],
    middleware: [requireAuth],
    request: { params: ParamIdSchema },
    responses: {
      501: {
        content: { "application/json": { schema: MessageResponseSchema } },
        description: "Not implemented",
      },
    },
  }),
  (_c) => {
    //TODO: implement readlist deletion logic
    return _c.json({ message: "Readlist deletion not implemented yet" }, 501);
  },
);

/**
 * GET /api/readlists/{id}/download
 *
 * Download a specific readlist by ID.
 */
app.openapi(
  createRoute({
    method: "get",
    path: "/{id}/download",
    summary: "Download a readlist",
    tags: ["Readlists"],
    middleware: [requireAuth],
    request: { params: ParamIdSchema },
    responses: {
      400: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Invalid readlist ID",
      },
      401: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Unauthorized",
      },
      501: {
        content: {
          "application/json": {
            schema: MessageResponseSchema,
          },
        },
        description: "Not implemented",
      },
    },
  }),
  (_c) => {
    const userId = _c.get("userId")!;

    //TODO: implement readlist download logic
    return _c.json({ message: "Readlist download not implemented yet" }, 501);
  },
);

/**
 * POST /api/readlists/add-readlist
 *
 * Add a new readlist.
 */
app.openapi(
  createRoute({
    method: "post",
    path: "/add-readlist",
    summary: "Add a new readlist",
    tags: ["Readlists"],
    middleware: [requireAuth],
    request: {
      body: {
        content: {
          "application/json": {
            schema: AddReadlistSchema,
          },
        },
      },
    },
    responses: {
      400: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Invalid request body",
      },
      401: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Unauthorized",
      },
      501: {
        content: {
          "application/json": {
            schema: MessageResponseSchema,
          },
        },
        description: "Not implemented",
      },
    },
  }),
  (c) => {
    const body = c.req.valid("json");

    const userId = c.get("userId")!;

    const result = AddReadlistSchema.safeParse(body);
    if (!result.success) {
      return c.json(
        { message: "Invalid request body", errors: result.error },
        400,
      );
    }
    //TODO: implement readlist addition logic
    return c.json({ message: "Readlist addition not implemented yet" }, 501);
  },
);

export default app;
