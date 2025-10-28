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

const AddReadlistSchema = z.object({
  name: z.string().min(2).max(100).openapi({
    example: "My Readlist",
  }),
});

// Get all readlists
const getAllReadlistsRoute = createRoute({
  method: "get",
  path: "/",
  summary: "Get all readlists",
  tags: ["Readlists"],
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.array(z.object({ id: z.number(), name: z.string() })),
        },
      },
      description: "Readlists retrieved successfully",
    },
  },
});

app.openapi(getAllReadlistsRoute, (_c) => {
  //TODO: implement readlist retrieval logic
  const readlists = [{ id: 1, name: "Default Readlist" }];
  return _c.json(readlists);
});

// Get readlist by ID
const getReadlistByIdRoute = createRoute({
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
});

app.openapi(getReadlistByIdRoute, (c) => {
  const { id } = c.req.valid("param");
  //TODO: implement readlist retrieval logic
  const readlist = { id, name: "Default Readlist" };
  return c.json(readlist);
});

// Delete readlist
const deleteReadlistRoute = createRoute({
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
});

app.openapi(deleteReadlistRoute, (_c) => {
  //TODO: implement readlist deletion logic
  return _c.json({ message: "Readlist deletion not implemented yet" }, 501);
});

// Download readlist
const downloadReadlistRoute = createRoute({
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
});

app.openapi(downloadReadlistRoute, (_c) => {
  //TODO: implement readlist download logic
  return _c.json({ message: "Readlist download not implemented yet" }, 501);
});

// Add readlist
const addReadlistRoute = createRoute({
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
});

app.openapi(addReadlistRoute, (c) => {
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
});

export default app;
