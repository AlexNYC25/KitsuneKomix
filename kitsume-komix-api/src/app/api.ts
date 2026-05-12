import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";

import { apiLogger } from "#logger/loggers.ts";
import { env } from "#config/env.ts";

import apiRouter from "#routes/api/api.router.ts";
import webRouter from "#routes/web/web.router.ts";
import healthRouter from "#routes/health/health.router.ts";

const app = new OpenAPIHono<{ Variables: { requestId: string } }>();

// CORS middleware must be registered BEFORE routes
app.use(
  "*",
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Content-Disposition", "Content-Length", "Content-Type"],
  }),
);

// Request ID middleware — generates a UUID for each request for log correlation
app.use("*", async (c, next) => {
  const requestId = crypto.randomUUID();
  c.set("requestId", requestId);
  await next();
});

// API routes (highest priority)
app.route("/api", apiRouter);

// Health and system routes
app.route("/health", healthRouter);

// Vue.js SPA (catch-all for everything else)
app.route("/", webRouter);

app.notFound((c) => {
  return c.json({ error: "Not Found" }, 404);
});

app.onError((err, c) => {
  const requestId = c.get("requestId") || "unknown";
  apiLogger.error({ requestId, err }, `Unhandled error: ${err.message}`);
  return c.json({ error: "Internal Server Error", requestId }, 500);
});

export default app;
