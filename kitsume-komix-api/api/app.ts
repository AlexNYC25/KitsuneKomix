import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from 'hono/cors';
import { swaggerUI } from "@hono/swagger-ui";
import rootRouter from "./routes/root.router.ts";
import apiRouter from "./routes/api.router.ts";
import webRouter from "./routes/web.router.ts";

import { apiLogger } from "../logger/loggers.ts";

const app = new OpenAPIHono();

// API routes (highest priority)
app.route("/api", apiRouter);

// Health and system routes
app.route("/health", rootRouter);

// Vue.js SPA (catch-all for everything else)
// @ts-ignore: Type compatibility issue between Hono versions  
app.route("/", webRouter);

// @ts-ignore: Type compatibility issue with middleware
app.use('*', cors({
  origin: 'http://localhost:5173', // Replace with your frontend's origin
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// OpenAPI documentation endpoint
app.doc('/api/doc', {
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'KitsuneKomix API',
    description: 'API documentation for KitsuneKomix comic book management system',
  },
});

// Swagger UI for API documentation
app.get('/api/ui', swaggerUI({ url: '/api/doc' }));

app.notFound((c) => {
  return c.json({ error: "Not Found" }, 404);
});

app.onError((err, c) => {
  apiLogger.error("Unhandled error: " + err.message);
  return c.json({ error: "Internal Server Error" }, 500);
});

export default app;
