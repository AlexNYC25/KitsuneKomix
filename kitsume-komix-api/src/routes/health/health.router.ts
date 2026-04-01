import { createRoute, OpenAPIHono } from "@hono/zod-openapi";

import { MessageResponseSchema } from "#zod/schemas/response.schema.ts";

const healthRouter = new OpenAPIHono();

healthRouter.openapi(
  createRoute({
    method: "get",
    path: "/",
    summary: "Health check",
    tags: ["Root"],
    responses: {
      200: {
        content: { "application/json": { schema: MessageResponseSchema } },
        description: "Health check",
      },
    },
  }),
  (c) => {
    // TODO: Add db checks to see if the databases are responsive and healthy

    // TODO: return info about the system, such as version, uptime, etc.

    // For now, just return a simple message indicating the API is up

    return c.json({ message: "Health check passed", status: "ok" });
  },
);

export default healthRouter;
