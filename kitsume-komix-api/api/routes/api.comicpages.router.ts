import { z, createRoute, OpenAPIHono } from "@hono/zod-openapi";

const app = new OpenAPIHono();

const MessageResponseSchema = z.object({
  message: z.string(),
});

const ParamIdSchema = z.object({
  id: z.string().openapi({
    param: { name: 'id', in: 'path' },
    example: '1',
  }),
});

// Get duplicates
const getDuplicatesRoute = createRoute({
  method: "get",
  path: "/duplicates",
  summary: "Get duplicate comic pages",
  description: "Detect duplicate comic pages in the system",
  tags: ["Comic Pages"],
  responses: {
    501: {
      content: { "application/json": { schema: MessageResponseSchema } },
      description: "Not implemented",
    },
  },
});

app.openapi(getDuplicatesRoute, (_c) => {
  //TODO: implement duplicate detection logic
  return _c.json({ message: "Duplicate detection not implemented yet" }, 501);
});

// Get duplicates by ID
const getDuplicateByIdRoute = createRoute({
  method: "get",
  path: "/duplicates/{id}",
  summary: "Get duplicate for specific comic page",
  tags: ["Comic Pages"],
  request: { params: ParamIdSchema },
  responses: {
    501: {
      content: { "application/json": { schema: MessageResponseSchema } },
      description: "Not implemented",
    },
  },
});

app.openapi(getDuplicateByIdRoute, (_c) => {
  //TODO: implement duplicate detection logic for specific comic page
  return _c.json({
    message: "Duplicate detection for comic page not implemented yet",
  }, 501);
});

// Delete duplicate
const deleteDuplicateRoute = createRoute({
  method: "post",
  path: "/duplicates/{id}/delete",
  summary: "Delete a duplicate comic page",
  tags: ["Comic Pages"],
  request: { params: ParamIdSchema },
  responses: {
    501: {
      content: { "application/json": { schema: MessageResponseSchema } },
      description: "Not implemented",
    },
  },
});

app.openapi(deleteDuplicateRoute, (_c) => {
  //TODO: implement duplicate deletion logic
  return _c.json({ message: "Duplicate deletion not implemented yet" }, 501);
});

export default app;
