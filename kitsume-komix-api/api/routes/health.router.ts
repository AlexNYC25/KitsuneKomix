import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { MessageResponseSchema } from "../../zod/schemas/response.schema.ts";

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
  (_c) => {
    return _c.json({ message: "Health check passed", status: "ok" });
  },
);

export default healthRouter;
