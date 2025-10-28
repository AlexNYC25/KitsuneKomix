import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";

const rootRouter = new OpenAPIHono();

const MessageResponseSchema = z.object({
  message: z.string(),
  status: z.string().optional(),
});

const welcomeRoute = createRoute({
  method: "get",
  path: "/",
  summary: "Welcome message",
  tags: ["Root"],
  responses: {
    200: {
      content: { "application/json": { schema: MessageResponseSchema } },
      description: "Welcome message",
    },
  },
});

rootRouter.openapi(welcomeRoute, (_c) => {
  return _c.json({ message: "Welcome to the API" });
});

const healthRoute = createRoute({
  method: "get",
  path: "/health",
  summary: "Health check",
  tags: ["Root"],
  responses: {
    200: {
      content: { "application/json": { schema: MessageResponseSchema } },
      description: "Health check",
    },
  },
});

rootRouter.openapi(healthRoute, (_c) => {
  return _c.json({ message: "Health check passed", status: "ok" });
});

export default rootRouter;
