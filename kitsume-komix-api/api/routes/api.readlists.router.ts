import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import camelcasekeys from "camelcase-keys";

import { requireAuth } from "../middleware/authChecks.ts";

import type { AppEnv } from "#types/index.ts";
import type { QueryData, RequestFilterParameters, RequestSortParameters } from "#types/index.ts";

import { fetchAllComicStoryArcs } from "../services/comicStoryArcs.service.ts";
import { ComicArcResponseSchema } from "../../zod/schemas/response.schema.ts";

const app = new OpenAPIHono<AppEnv>();

// Register Bearer Auth security scheme for OpenAPI
app.openAPIRegistry.registerComponent("securitySchemes", "Bearer", {
  type: "http",
  scheme: "bearer",
});

const MessageResponseSchema = z.object({
  message: z.string(),
});

const ErrorResponseSchema = z.object({
  message: z.string(),
  errors: z.any().optional(),
});

const ParamIdSchema = z.object({
  id: z.string().openapi({
    param: { name: "id", in: "path" },
    example: "1",
  }),
});

const AddReadlistSchema = z.object({
  name: z.string().min(2).max(100).openapi({
    example: "My Readlist",
  }),
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
    request: {
      query: z.object({
        page: z.string().optional().transform((val) => (val ? parseInt(val) : 1)).openapi({
          description: "Page number for pagination",
          example: 1,
        }),
        pageSize: z.string().optional().transform((val) => (val ? parseInt(val) : 10)).openapi({
          description: "Number of items per page",
          example: 10,
        }),
        filter: z.string().optional().openapi({
          description: "Filter readlists by name",
          example: "My Readlist",
        }),
        filterProperty: z.string().optional().openapi({
          description: "Property to filter readlists by",
          example: "name",
        }),
        sort: z.string().optional().openapi({
          description: "Sort readlists by a specific property",
          example: "name",
        }),
        sortDirection: z.enum(["asc", "desc"]).optional().openapi({
          description: "Sort direction",
          example: "asc",
        }), 
      }),
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: ComicArcResponseSchema,
          },
        },
        description: "Readlists retrieved successfully",
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
  }), async (c) => {
    const user = c.get("user");
    if (!user) {
      return c.json(
        { message: "Unauthorized" },
        401,
      );
    }

    // Extract and construct pagination parameters
    const query = c.req.valid("query");
    const paginationParams: QueryData = {
      page: query.page,
      pageSize: query.pageSize,
    };

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

    const readlists = await fetchAllComicStoryArcs(paginationParams, filterParams, sortParams);

    if (!readlists) {
      return c.json(
        { message: "Error fetching readlists" },
        500,
      );
    }

    return c.json(camelcasekeys(readlists, { deep: true }), 200);
  }
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
    },
  }), (c) => {
    const { id } = c.req.valid("param");
    //TODO: implement readlist retrieval logic
    const readlist = { id, name: "Default Readlist" };
    return c.json(readlist);
  }
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
    request: { params: ParamIdSchema },
    responses: {
      501: {
        content: { "application/json": { schema: MessageResponseSchema } },
        description: "Not implemented",
      },
    },
  }), (_c) => {
    //TODO: implement readlist deletion logic
    return _c.json({ message: "Readlist deletion not implemented yet" }, 501);
  }
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
    request: { params: ParamIdSchema },
    responses: {
      501: {
        content: { "application/json": { schema: MessageResponseSchema } },
        description: "Not implemented",
      },
    },
  }), (_c) => {
    //TODO: implement readlist download logic
    return _c.json({ message: "Readlist download not implemented yet" }, 501);
  }
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
      501: {
        content: { "application/json": { schema: MessageResponseSchema } },
        description: "Not implemented",
      },
      400: {
        content: { "application/json": { schema: ErrorResponseSchema } },
        description: "Invalid request body",
      },
    },
  }), (c) => {
    const body = c.req.valid("json");
    const result = AddReadlistSchema.safeParse(body);
    if (!result.success) {
      return c.json(
        { message: "Invalid request body", errors: result.error },
        400,
      );
    }
    //TODO: implement readlist addition logic
    return c.json({ message: "Readlist addition not implemented yet" }, 501);
  }
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
    request: { 
      params: z.object({
        comicBookId: z.string().openapi({
          param: { name: "comicBookId", in: "path" },
          example: "1",
        }),
      }) 
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: z.array(z.object({ id: z.number(), name: z.string() })),
          },
        },
        description: "Readlists retrieved successfully",
      },
      501: {
        content: { "application/json": { schema: MessageResponseSchema } },
        description: "Not implemented",
      },
    },
  }), (c) => {
    const { comicBookId } = c.req.valid("param");

    return c.json(
      { message: `Readlists for comic book ID ${comicBookId} not implemented yet` },
      501,
    );
  }
);


export default app;
