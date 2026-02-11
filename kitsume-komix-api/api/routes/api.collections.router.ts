import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";


import { MessageResponseSchema, ErrorResponseSchema } from "#schemas/response.schema.ts";
import { ParamIdSchema, AddCollectionSchema, ParamIdThumbnailIdSchema } from "#schemas/request.schema.ts";
import type { AppEnv } from "#types/index.ts";

const app = new OpenAPIHono<AppEnv>();

// Register Bearer Auth security scheme for OpenAPI
app.openAPIRegistry.registerComponent("securitySchemes", "Bearer", {
  type: "http",
  scheme: "bearer",
});

/**
 * GET /api/collections/
 * 
 * Get all collections
 */
app.openapi(
    createRoute({
    method: "get",
    path: "/",
    summary: "Get all collections",
    tags: ["Collections"],
    responses: {
      200: {
        content: {
          "application/json": {
            schema: z.array(z.object({ id: z.number(), name: z.string() })),
          },
        },
        description: "Collections retrieved successfully",
      },
    },
  }), (_c) => {
    //TODO: implement collections retrieval logic
    const collections = [{ id: 1, name: "Default Collection" }];
    return _c.json(collections);
  }
);

/**
 * GET /api/collections/{id}
 * 
 * Get a collection by its ID
 */
app.openapi(
  createRoute({
    method: "get",
    path: "/{id}",
    summary: "Get a collection by ID",
    tags: ["Collections"],
    request: { params: ParamIdSchema },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: z.object({ id: z.string(), name: z.string() }),
          },
        },
        description: "Collection retrieved successfully",
      },
    },
  }), (c) => {
    const { id } = c.req.valid("param");
    //TODO: implement collection retrieval logic
    const collection = { id, name: "Default Collection" };
    return c.json(collection);
  }
);

/**
 * DELETE /api/collections/{id}
 * 
 * Delete a collection by its ID
 */
app.openapi(
  createRoute({
    method: "delete",
    path: "/{id}",
    summary: "Delete a collection",
    tags: ["Collections"],
    request: { params: ParamIdSchema },
    responses: {
      501: {
        content: { "application/json": { schema: MessageResponseSchema } },
        description: "Not implemented",
      },
    },
  }), (_c) => {
    //TODO: implement collection deletion logic
    return _c.json({ message: "Collection deletion not implemented yet" }, 501);
  }
);

/**
 * GET /api/collections/{id}/series
 * 
 * Get series in a collection
 */
app.openapi(
  createRoute({
    method: "get",
    path: "/{id}/series",
    summary: "Get series in a collection",
    tags: ["Collections"],
    request: { params: ParamIdSchema },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: z.array(z.object({ id: z.number(), title: z.string() })),
          },
        },
        description: "Series retrieved successfully",
      },
    },
  }), (_c) => {
    //TODO: implement collection series retrieval logic
    const series = [{ id: 1, title: "Default Series" }];
    return _c.json(series);
  }
);

/**
 * GET /api/collections/{id}/thumbnails
 * 
 * Get thumbnails for a collection
 */
app.openapi(
  createRoute({
    method: "get",
    path: "/{id}/thumbnails",
    summary: "Get thumbnails for a collection",
    tags: ["Collections"],
    request: { params: ParamIdSchema },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: z.array(z.object({ id: z.number(), url: z.string() })),
          },
        },
        description: "Thumbnails retrieved successfully",
      },
    },
  }), (_c) => {
    //TODO: implement collection thumbnails retrieval logic
    const thumbnails = [{ id: 1, url: "http://example.com/thumb1.jpg" }];
    return _c.json(thumbnails);
  }
);

/**
 * PUT /api/collections/{id}/thumbnail/select/{thumbnailId}
 */
app.openapi(
  createRoute({
    method: "put",
    path: "/{id}/thumbnail/select/{thumbnailId}",
    summary: "Set selected thumbnail for collection",
    tags: ["Collections"],
    request: { params: ParamIdThumbnailIdSchema },
    responses: {
      501: {
        content: { "application/json": { schema: MessageResponseSchema } },
        description: "Not implemented",
      },
    },
  }), (_c) => {
    //TODO: implement collection thumbnail update logic
    return _c.json(
      { message: "Collection thumbnail update not implemented yet" },
      501,
    );
  }
);

/**
 * POST /api/collections/add-collection
 * 
 * Add a new collection
 */
app.openapi(
  createRoute({
    method: "post",
    path: "/add-collection",
    summary: "Add a new collection",
    tags: ["Collections"],
    request: {
      body: {
        content: {
          "application/json": {
            schema: AddCollectionSchema,
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
    const result = AddCollectionSchema.safeParse(body);
    if (!result.success) {
      return c.json(
        { message: "Invalid request body", errors: result.error },
        400,
      );
    }
    //TODO: implement collection addition logic
    return c.json({ message: "Collection addition not implemented yet" }, 501);
  }
);

/**
 * PUT /api/collections/{id}/update
 * 
 * Update a collection by its ID
 */
app.openapi(
  createRoute({
    method: "put",
    path: "/{id}/update",
    summary: "Update a collection",
    tags: ["Collections"],
    request: { params: ParamIdSchema },
    responses: {
      501: {
        content: { "application/json": { schema: MessageResponseSchema } },
        description: "Not implemented",
      },
    },
  }), (_c) => {
    //TODO: implement collection update logic
    return _c.json({ message: "Collection update not implemented yet" }, 501);
  }
);

/**
 * POST /api/collections/{id}/add-comics
 * 
 * Add comics to a collection
 */
app.openapi(
  createRoute({
    method: "post",
    path: "/{id}/add-comics",
    summary: "Add comics to collection",
    tags: ["Collections"],
    request: { params: ParamIdSchema },
    responses: {
      501: {
        content: { "application/json": { schema: MessageResponseSchema } },
        description: "Not implemented",
      },
    },
  }), (_c) => {
    // TODO: implement add comics to collection logic
    return _c.json(
      { message: "Add comics to collection not implemented yet" },
      501,
    );
  }
);

/**
 * POST /api/collections/{id}/remove-comics
 * 
 * Remove comic series from a collection
 */
app.openapi(
  createRoute({
    method: "post",
    path: "/{id}/remove-comics",
    summary: "Remove comic series from collection",
    tags: ["Collections"],
    request: { params: ParamIdSchema },
    responses: {
      501: {
        content: { "application/json": { schema: MessageResponseSchema } },
        description: "Not implemented",
      },
    },
  }), (_c) => {
    // TODO: implement remove comics from collection logic
    return _c.json({
      message: "Remove comics from collection not implemented yet",
    }, 501);
  }
);

export default app;
