import { Hono } from "hono";
import { cors } from 'hono/cors';
import rootRouter from "./routes/root.router.ts";
import apiRouter from "./routes/api.router.ts";
import webRouter from "./routes/web.router.ts";

import { apiLogger } from "../logger/loggers.ts";

const app = new Hono();

// API routes (highest priority)
app.route("/api", apiRouter);

// Health and system routes
app.route("/health", rootRouter);

// Vue.js SPA (catch-all for everything else)
app.route("/", webRouter);

app.use('*', cors({
  origin: 'http://localhost:5173', // Replace with your frontend's origin
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

app.notFound((c) => {
  return c.json({ error: "Not Found" }, 404);
});

app.onError((err, c) => {
  apiLogger.error("Unhandled error: " + err.message);
  return c.json({ error: "Internal Server Error" }, 500);
});

export default app;
