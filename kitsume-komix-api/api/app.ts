import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";

import apiRouter from "./routes/api.router.ts";
import webRouter from "./routes/web.router.ts";
import healthRouter from "./routes/health.router.ts";

import { apiLogger } from "../logger/loggers.ts";

import { CLIENT_URL } from "../config/enviorement.ts";

const app = new OpenAPIHono();

// API routes (highest priority)
app.route("/api", apiRouter);

// Health and system routes
app.route("/health", healthRouter);

// Vue.js SPA (catch-all for everything else)
app.route("/", webRouter);

app.use(
  "*",
  cors({
    origin: CLIENT_URL,
    allowMethods: ["GET", "POST", "PUT", "DELETE"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

app.notFound((c) => {
  return c.json({ error: "Not Found" }, 404);
});

app.onError((err, c) => {
  apiLogger.error("Unhandled error: " + err.message);
  return c.json({ error: "Internal Server Error" }, 500);
});

export default app;
