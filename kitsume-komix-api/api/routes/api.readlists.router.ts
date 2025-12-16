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
  }), (_c) => {
    //TODO: implement readlist retrieval logic
    const readlists = [{ id: 1, name: "Default Readlist" }];
    return _c.json(readlists);
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
