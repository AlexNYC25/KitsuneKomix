import { z, createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { requireAuth } from "../middleware/authChecks.ts";
import { AuthHeaderSchema } from "../../zod/schemas/header.schema.ts";
import type { AppEnv } from "../../types/index.ts";
import { getLatestComicSeriesUserCanAccess } from "../services/comicSeries.service.ts";

const app = new OpenAPIHono<AppEnv>();

app.openAPIRegistry.registerComponent('securitySchemes', 'Bearer', {
  type: 'http',
  scheme: 'bearer',
});

const MessageResponseSchema = z.object({
  message: z.string(),
});

const ParamIdSchema = z.object({
  id: z.string().openapi({
    param: { name: 'id', in: 'path' },
    example: '1',
  }),
});

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

const ParamLetterSchema = z.object({
  letter: z.string().openapi({
    param: { name: 'letter', in: 'path' },
    example: 'A',
  }),
});

const ComicSeriesResponseSchema = z.object({
  data: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      description: z.string().nullable(),
      folderPath: z.string(),
      createdAt: z.string(),
      updatedAt: z.string(),
      thumbnailUrl: z.string().nullable(),
    })
  ),
  meta: z.object({
    total: z.number(),
    page: z.number(),
    pageSize: z.number(),
    hasNextPage: z.boolean(),
  }),
  message: z.string(),
});

// Get all series
const getAllSeriesRoute = createRoute({
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
});

app.openapi(getAllSeriesRoute, (_c) => {
  // TODO: use the model/service to get the series from the database
  return _c.json({ message: "Comic Series API is running" }, 200);
});

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
    request: { headers: AuthHeaderSchema },
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

    const latestSeries = await getLatestComicSeriesUserCanAccess(userId);

    // Map snake_case properties to camelCase as expected by the schema
    const mappedSeries = latestSeries.map((series: any) => ({
      id: series.id,
      name: series.name,
      description: series.description,
      folderPath: series.folder_path ?? "",
      createdAt: series.created_at,
      updatedAt: series.updated_at,
      thumbnailUrl: series.thumbnailUrl ?? null,
    }));

    return c.json({ 
      data: mappedSeries,
      meta: { total: mappedSeries.length, page: 1, pageSize: 10, hasNextPage: false },
      message: "Latest Comic Series API is running" 
    }, 200);
  }
);


// Get series by ID
const getSeriesByIdRoute = createRoute({
  method: "get",
  path: "/{id}",
  summary: "Get a comic series by ID",
  tags: ["Comic Series"],
  request: { params: ParamIdSchema },
  responses: {
    200: {
      content: { "application/json": { schema: MessageResponseSchema } },
      description: "Series retrieved successfully",
    },
  },
});

app.openapi(getSeriesByIdRoute, (c) => {
  const { id } = c.req.valid("param");
  return c.json({ message: `Comic Series API is running for ID ${id}` }, 200);
});

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

// Get new series
const getNewRoute = createRoute({
  method: "get",
  path: "/new",
  summary: "Get new comic series",
  tags: ["Comic Series"],
  responses: {
    200: {
      content: { "application/json": { schema: MessageResponseSchema } },
      description: "New series retrieved successfully",
    },
  },
});

app.openapi(getNewRoute, (_c) => {
  return _c.json({ message: "New Comic Series API is running" }, 200);
});

// Get updated series
const getUpdatedRoute = createRoute({
  method: "get",
  path: "/updated",
  summary: "Get updated comic series",
  tags: ["Comic Series"],
  responses: {
    200: {
      content: { "application/json": { schema: MessageResponseSchema } },
      description: "Updated series retrieved successfully",
    },
  },
});

app.openapi(getUpdatedRoute, (_c) => {
  return _c.json({ message: "Updated Comic Series API is running" }, 200);
});

export default app;
