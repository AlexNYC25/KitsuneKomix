import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import camelcasekeys from "camelcase-keys";

import { requireAuth } from "../middleware/authChecks.ts";

import { fetchComicStoryArcs } from "../services/comicStoryArcs.service.ts";
import {
  ComicStoryArcMultipleResponseSchema,
  ErrorResponseSchema,
  MessageResponseSchema,
  ReadlistsResponseSchema,
} from "#schemas/response.schema.ts";
import {
  AddReadlistSchema,
  PaginationSortFilterQuerySchema,
  ParamComicBookIdSchema,
  ParamIdSchema,
} from "#schemas/request.schema.ts";

import type {
  AccessRefreshTokenCombinedPayload,
  AppEnv,
  QueryData,
} from "#types/index.ts";

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
      query: PaginationSortFilterQuerySchema,
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: ComicStoryArcMultipleResponseSchema,
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
    const user: AccessRefreshTokenCombinedPayload | undefined = c.get("user");

    if (!user || !user.sub) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const userId: number = parseInt(user.sub, 10);
    if (isNaN(userId)) {
      return c.json({ message: "Invalid user ID" }, 400);
    }

    // Extract and construct pagination parameters
    const query = c.req.valid("query");
    const paginationParams: QueryData = {
      page: query.page,
      pageSize: query.pageSize,
    };

    /*
    // Construct filter parameters
    const filterParams: RequestFilterParameters = {
      filterProperty: query.filterProperty,
      filter: query.filter,
    };

    // Construct sort parameters
    const sortParams: RequestSortParameters = {
      sortProperty: query.sort,
      sortOrder: query.sortDirection,
    };
    */

    //const readlists = await fetchAllComicStoryArcs(paginationParams, filterParams, sortParams);

    const readlists = null; //TODO: implement readlist fetching logic

    if (!readlists) {
      return c.json(
        { message: "Error fetching readlists" },
        500,
      );
    }

    return c.json(camelcasekeys(readlists, { deep: true }), 200);
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
    middlware: [requireAuth],
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

    const user: AccessRefreshTokenCombinedPayload | undefined = c.get("user");

    if (!user || !user.sub) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const userId: number = parseInt(user.sub, 10);
    if (isNaN(userId)) {
      return c.json({ message: "Invalid user ID" }, 400);
    }

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
    const user: AccessRefreshTokenCombinedPayload | undefined = _c.get("user");

    if (!user || !user.sub) {
      return _c.json({ message: "Unauthorized" }, 401);
    }

    const userId: number = parseInt(user.sub, 10);
    if (isNaN(userId)) {
      return _c.json({ message: "Invalid user ID" }, 400);
    }

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

    const user: AccessRefreshTokenCombinedPayload | undefined = c.get("user");

    if (!user || !user.sub) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const userId: number = parseInt(user.sub, 10);
    if (isNaN(userId)) {
      return c.json({ message: "Invalid user ID" }, 400);
    }

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

/**
 * GET /api/readlists/comic-book/{comicBookId}
 *
 * Get all readlists containing a specific comic book.
 */
app.openapi(
  createRoute({
    method: "get",
    path: "/comic-book/{comicBookId}",
    summary: "Get readlists containing a specific comic book",
    tags: ["Readlists"],
    middleware: [requireAuth],
    request: { params: ParamComicBookIdSchema },
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
        description: "Invalid comic book ID",
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
        content: { "application/json": { schema: MessageResponseSchema } },
        description: "Not implemented",
      },
    },
  }),
  (c) => {
    const { comicBookId } = c.req.valid("param");

    const user: AccessRefreshTokenCombinedPayload | undefined = c.get("user");

    if (!user || !user.sub) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const userId: number = parseInt(user.sub, 10);
    if (isNaN(userId)) {
      return c.json({ message: "Invalid user ID" }, 400);
    }

    return c.json(
      {
        message:
          `Readlists for comic book ID ${comicBookId} not implemented yet`,
      },
      501,
    );
  },
);

export default app;
