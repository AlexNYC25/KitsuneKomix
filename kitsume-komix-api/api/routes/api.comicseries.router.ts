import { z, createRoute, OpenAPIHono } from "@hono/zod-openapi";
import camelcasekeys from "camelcase-keys";

import { requireAuth } from "../middleware/authChecks.ts";

import { 
  getLatestComicSeriesUserCanAccess, 
  getUpdatedComicSeriesUserCanAccess, 
  getSelectedComicSeriesDetails 
} from "../services/comicSeries.service.ts";

import type { AppEnv } from "../../types/index.ts";
import { AuthHeaderSchema } from "../../zod/schemas/header.schema.ts";
import { ParamIdSchema, ParamLetterSchema, ParamIdThumbnailIdSchema, PaginationQuerySchema } from "../../zod/schemas/request.schema.ts";
import { MessageResponseSchema, ComicSeriesResponseSchema, ComicSeriesWithMetadataAndThumbnailsResponseSchema, ComicSeriesWithComicsMetadataAndThumbnailsResponseSchema } from "../../zod/schemas/response.schema.ts";


const app = new OpenAPIHono<AppEnv>();

app.openAPIRegistry.registerComponent('securitySchemes', 'Bearer', {
  type: 'http',
  scheme: 'bearer',
});

// TODO: Depreate this and use the one from response.schema.ts: ParamIdThumbnailIdSchema
const ParamIdThumbIdSchema = z.object({
  id: z.string().openapi({
    param: { name: 'id', in: 'path' },
    example: '1',
  }),
  thumbId: z.string().openapi({
    param: { name: 'thumbId', in: 'path' },
    example: '1',
  }),
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
    responses: {
      200: {
        content: { "application/json": { schema: MessageResponseSchema } },
        description: "Series retrieved successfully",
      },
    },
  }),
  (_c) => {
    // TODO: use the model/service to get the series from the database
    return _c.json({ message: "Comic Series API is running" }, 200);
  }
);

/**
 * GET /api/comic-series/latest
 * 
 * Get the latest comic series that the current user has access to.
 * Admins can see all series, regular users only those they have been granted access to.
 */
app.openapi(
  createRoute({
    method: "get",
    path: "/latest",
    summary: "Get latest comic series",
    tags: ["Comic Series"],
    middleware: [requireAuth],
    request: { headers: AuthHeaderSchema, query: PaginationQuerySchema },
    responses: {
      200: {
        content: { "application/json": { schema: ComicSeriesResponseSchema } },
        description: "Latest series retrieved successfully",
      },
      400: { content: { "application/json": { schema: MessageResponseSchema } }, description: "Bad Request" },
      401: { content: { "application/json": { schema: MessageResponseSchema } }, description: "Unauthorized" },
      500: { content: { "application/json": { schema: MessageResponseSchema } }, description: "Internal Server Error" },
    },
  }),
  async (c) => {
    const user = c.get("user");
    if (!user || !user.sub) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const userId = parseInt(user.sub, 10);
    if (isNaN(userId)) {
      return c.json({ message: "Invalid user ID" }, 400);
    }

    const { page = 1, pageSize = 20 } = c.req.valid("query");

    const offset = (page - 1) * pageSize;
    const limit = pageSize;

    const latestSeries = await getLatestComicSeriesUserCanAccess(userId, limit, offset);

    // Convert keys to camelCase and ensure correct types for folderPath and thumbnailUrl
    const formatedLatestSeries = latestSeries.map((series) => {
      const camel = camelcasekeys(series, { deep: true });
      return {
        ...camel,
        thumbnailUrl: camel.thumbnailUrl ?? null,
      };
    });

    return c.json({ 
      data: formatedLatestSeries,
      meta: { total: formatedLatestSeries.length, page: 1, pageSize: 10, hasNextPage: false },
      message: "Latest Comic Series API is running" 
    }, 200);
  }
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
    request: { headers: AuthHeaderSchema, query: PaginationQuerySchema },
    responses: {
      200: {
        content: { "application/json": { schema: ComicSeriesResponseSchema } },
        description: "Latest series retrieved successfully",
      },
      400: { content: { "application/json": { schema: MessageResponseSchema } }, description: "Bad Request" },
      401: { content: { "application/json": { schema: MessageResponseSchema } }, description: "Unauthorized" },
      500: { content: { "application/json": { schema: MessageResponseSchema } }, description: "Internal Server Error" },
    },
  }), 
  async (c) => {
    const user = c.get("user");
    if (!user || !user.sub) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const userId = parseInt(user.sub, 10);
    if (isNaN(userId)) {
      return c.json({ message: "Invalid user ID" }, 400);
    }

    const { page = 1, pageSize = 20 } = c.req.valid("query");

    const offset = (page - 1) * pageSize;
    const limit = pageSize;

    const latestSeries = await getUpdatedComicSeriesUserCanAccess(userId, limit, offset);

    // Convert keys to camelCase and ensure correct types for folderPath and thumbnailUrl
    const formatedLatestSeries = latestSeries.map((series) => {
      const camel = camelcasekeys(series, { deep: true });
      return {
        ...camel,
        thumbnailUrl: camel.thumbnailUrl ?? null,
      };
    });

    return c.json({ 
      data: formatedLatestSeries,
      meta: { total: formatedLatestSeries.length, page: 1, pageSize: 10, hasNextPage: false },
      message: "Latest Comic Series API is running" 
    }, 200);
  }
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
    request: { params: ParamIdSchema },
    responses: {
      200: {
        content: { "application/json": { schema: ComicSeriesWithComicsMetadataAndThumbnailsResponseSchema } },
        description: "Series retrieved successfully",
      },
      400: { content: { "application/json": { schema: MessageResponseSchema } }, description: "Bad Request" },
      401: { content: { "application/json": { schema: MessageResponseSchema } }, description: "Unauthorized" },
      404: { content: { "application/json": { schema: MessageResponseSchema } }, description: "Not Found" },
      500: { content: { "application/json": { schema: MessageResponseSchema } }, description: "Internal Server Error" },
    },
  }), 
  async (c) => {
    const user = c.get("user");
    if (!user || !user.sub) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const { id } = c.req.valid("param");
    if (!id) {
      return c.json({ message: "Invalid series ID" }, 400);
    }

    try {
      const series = await getSelectedComicSeriesDetails(parseInt(id, 10));
      if (!series) {
        return c.json({ message: "Comic series not found" }, 404);
      }
      const camel = camelcasekeys(series, { deep: true });
      // Ensure every comic book object has thumbnailUrl explicitly set to string | null
      camel.comics = {
        ...camel.comics,
        books: (camel.comics?.books || []).map((element: any) => ({
          ...element,
          thumbnailUrl: element.thumbnailUrl ?? null,
        })),
      };
      const comicSeriesData = { 
        ...camel, 
        thumbnailUrl: camel.thumbnailUrl ?? null
      };
      return c.json({ 
        data: comicSeriesData as any,
        message: "Selected Comic Series API is running" 
      }, 200);
    } catch (error) {
      return c.json({ message: "Internal Server Error" + error }, 500);
    }

  }
);

// Analyze series
const analyzeSeriesRoute = createRoute({
  method: "get",
  path: "/{id}/analyse",
  summary: "Analyze a comic series",
  tags: ["Comic Series"],
  request: { params: ParamIdSchema },
  responses: {
    200: {
      content: { "application/json": { schema: MessageResponseSchema } },
      description: "Series analysis started",
    },
  },
});

app.openapi(analyzeSeriesRoute, (c) => {
  const { id } = c.req.valid("param");
  return c.json({ message: `Comic Series API is running for ID ${id} - Analysis` }, 200);
});

// Download series
const downloadSeriesRoute = createRoute({
  method: "get",
  path: "/{id}/download",
  summary: "Download a comic series",
  tags: ["Comic Series"],
  request: { params: ParamIdSchema },
  responses: {
    200: {
      content: { "application/json": { schema: MessageResponseSchema } },
      description: "Series download started",
    },
  },
});

app.openapi(downloadSeriesRoute, (c) => {
  const { id } = c.req.valid("param");
  return c.json({ message: `Comic Series API is running for ID ${id} - Download` }, 200);
});

// Update series metadata
const updateMetadataRoute = createRoute({
  method: "patch",
  path: "/{id}/metadata",
  summary: "Update series metadata",
  tags: ["Comic Series"],
  request: { params: ParamIdSchema },
  responses: {
    200: {
      content: { "application/json": { schema: MessageResponseSchema } },
      description: "Metadata updated successfully",
    },
  },
});

app.openapi(updateMetadataRoute, (c) => {
  const { id } = c.req.valid("param");
  return c.json({ message: `Comic Series API is running for ID ${id} - Metadata Update` }, 200);
});

// Update series progress
const updateProgressRoute = createRoute({
  method: "post",
  path: "/{id}/progress",
  summary: "Update series progress",
  tags: ["Comic Series"],
  request: { params: ParamIdSchema },
  responses: {
    200: {
      content: { "application/json": { schema: MessageResponseSchema } },
      description: "Progress updated successfully",
    },
  },
});

app.openapi(updateProgressRoute, (c) => {
  const { id } = c.req.valid("param");
  return c.json({ message: `Comic Series API is running for ID ${id} - Progress Update` }, 200);
});

// Get series thumbnails
const getThumbnailsRoute = createRoute({
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
});

app.openapi(getThumbnailsRoute, (c) => {
  const { id } = c.req.valid("param");
  return c.json({ message: `Comic Series API is running for ID ${id} - Thumbnails` }, 200);
});

// Create series thumbnail
const createThumbnailRoute = createRoute({
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
});

app.openapi(createThumbnailRoute, (c) => {
  const { id } = c.req.valid("param");
  return c.json({ message: `Comic Series API is running for ID ${id} - Thumbnail Creation` }, 200);
});

// Delete series thumbnail
const deleteThumbnailRoute = createRoute({
  method: "delete",
  path: "/{id}/thumbnail/{thumbId}",
  summary: "Delete series thumbnail",
  tags: ["Comic Series"],
  request: { params: ParamIdThumbIdSchema },
  responses: {
    200: {
      content: { "application/json": { schema: MessageResponseSchema } },
      description: "Thumbnail deleted successfully",
    },
  },
});

app.openapi(deleteThumbnailRoute, (c) => {
  const { id } = c.req.valid("param");
  return c.json({ message: `Comic Series API is running for ID ${id} - Thumbnail Deletion` }, 200);
});

// Get specific thumbnail
const getThumbnailByIdRoute = createRoute({
  method: "get",
  path: "/{id}/thumbnails/{thumbId}",
  summary: "Get specific thumbnail",
  tags: ["Comic Series"],
  request: { params: ParamIdThumbIdSchema },
  responses: {
    200: {
      content: { "application/json": { schema: MessageResponseSchema } },
      description: "Thumbnail retrieved successfully",
    },
  },
});

app.openapi(getThumbnailByIdRoute, (c) => {
  const { id } = c.req.valid("param");
  return c.json({ message: `Comic Series API is running for ID ${id} - Thumbnail Retrieval` }, 200);
});

// Update thumbnail cover
const updateThumbnailCoverRoute = createRoute({
  method: "put",
  path: "/{id}/thumbnail/{thumbId}/cover",
  summary: "Update thumbnail cover",
  tags: ["Comic Series"],
  request: { params: ParamIdThumbIdSchema },
  responses: {
    200: {
      content: { "application/json": { schema: MessageResponseSchema } },
      description: "Thumbnail cover updated successfully",
    },
  },
});

app.openapi(updateThumbnailCoverRoute, (c) => {
  const { id } = c.req.valid("param");
  return c.json({ message: `Comic Series API is running for ID ${id} - Thumbnail Cover Update` }, 200);
});

// Get alphabetical series
const getAlphabeticalRoute = createRoute({
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
});

app.openapi(getAlphabeticalRoute, (_c) => {
  return _c.json({ message: "Alphabetical Comic Series API is running" }, 200);
});

// Get series by letter
const getByLetterRoute = createRoute({
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
});

app.openapi(getByLetterRoute, (c) => {
  const { letter } = c.req.valid("param");
  return c.json({ message: `Alphabetical Comic Series API is running for letter ${letter}` }, 200);
});




export default app;
