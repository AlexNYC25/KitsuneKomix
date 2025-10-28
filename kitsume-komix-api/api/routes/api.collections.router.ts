import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";

const app = new OpenAPIHono();

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

const ParamIdThumbIdSchema = z.object({
  id: z.string().openapi({
    param: { name: "id", in: "path" },
    example: "1",
  }),
  thumbId: z.string().openapi({
    param: { name: "thumbId", in: "path" },
    example: "1",
  }),
});

const AddCollectionSchema = z.object({
  name: z.string().min(2).max(100).openapi({
    example: "My Collection",
  }),
});

// Get all collections
const getAllCollectionsRoute = createRoute({
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
});

app.openapi(getAllCollectionsRoute, (_c) => {
  //TODO: implement collections retrieval logic
  const collections = [{ id: 1, name: "Default Collection" }];
  return _c.json(collections);
});

// Get collection by ID
const getCollectionByIdRoute = createRoute({
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
});

app.openapi(getCollectionByIdRoute, (c) => {
  const { id } = c.req.valid("param");
  //TODO: implement collection retrieval logic
  const collection = { id, name: "Default Collection" };
  return c.json(collection);
});

// Delete collection
const deleteCollectionRoute = createRoute({
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
});

app.openapi(deleteCollectionRoute, (_c) => {
  //TODO: implement collection deletion logic
  return _c.json({ message: "Collection deletion not implemented yet" }, 501);
});

// Get collection series
const getCollectionSeriesRoute = createRoute({
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
});

app.openapi(getCollectionSeriesRoute, (_c) => {
  //TODO: implement collection series retrieval logic
  const series = [{ id: 1, title: "Default Series" }];
  return _c.json(series);
});

// Get collection thumbnails
const getCollectionThumbnailsRoute = createRoute({
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
});

app.openapi(getCollectionThumbnailsRoute, (_c) => {
  //TODO: implement collection thumbnails retrieval logic
  const thumbnails = [{ id: 1, url: "http://example.com/thumb1.jpg" }];
  return _c.json(thumbnails);
});

// Get specific thumbnail
const getCollectionThumbnailByIdRoute = createRoute({
  method: "get",
  path: "/{id}/thumbnails/{thumbId}",
  summary: "Get a specific thumbnail",
  tags: ["Collections"],
  request: { params: ParamIdThumbIdSchema },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({ id: z.string(), url: z.string() }),
        },
      },
      description: "Thumbnail retrieved successfully",
    },
  },
});

app.openapi(getCollectionThumbnailByIdRoute, (c) => {
  const { thumbId } = c.req.valid("param");
  //TODO: implement collection thumbnail retrieval logic
  const thumbnail = { id: thumbId, url: "http://example.com/thumb1.jpg" };
  return c.json(thumbnail);
});

// Update selected thumbnail
const updateSelectedThumbnailRoute = createRoute({
  method: "put",
  path: "/{id}/thumbnail/{thumbId}/selected",
  summary: "Set selected thumbnail for collection",
  tags: ["Collections"],
  request: { params: ParamIdThumbIdSchema },
  responses: {
    501: {
      content: { "application/json": { schema: MessageResponseSchema } },
      description: "Not implemented",
    },
  },
});

app.openapi(updateSelectedThumbnailRoute, (_c) => {
  //TODO: implement collection thumbnail update logic
  return _c.json(
    { message: "Collection thumbnail update not implemented yet" },
    501,
  );
});

// Add collection
const addCollectionRoute = createRoute({
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
});

app.openapi(addCollectionRoute, (c) => {
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
});

// Update collection
const updateCollectionRoute = createRoute({
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
});

app.openapi(updateCollectionRoute, (_c) => {
  //TODO: implement collection update logic
  return _c.json({ message: "Collection update not implemented yet" }, 501);
});

// Add comics to collection
const addComicsRoute = createRoute({
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
});

app.openapi(addComicsRoute, (_c) => {
  // TODO: implement add comics to collection logic
  return _c.json(
    { message: "Add comics to collection not implemented yet" },
    501,
  );
});

// Remove comics from collection
const removeComicsRoute = createRoute({
  method: "post",
  path: "/{id}/remove-comics",
  summary: "Remove comics from collection",
  tags: ["Collections"],
  request: { params: ParamIdSchema },
  responses: {
    501: {
      content: { "application/json": { schema: MessageResponseSchema } },
      description: "Not implemented",
    },
  },
});

app.openapi(removeComicsRoute, (_c) => {
  // TODO: implement remove comics from collection logic
  return _c.json({
    message: "Remove comics from collection not implemented yet",
  }, 501);
});

export default app;
