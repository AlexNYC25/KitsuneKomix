import { serveStatic } from "hono/deno";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";

// Router to serve the Vue.js production build from dist folder

const app = new OpenAPIHono();

// Serve static assets (CSS, JS, images) with proper cache headers
// This uses standard middleware since static assets don't need OpenAPI documentation
app.use(
  "/assets/*",
  serveStatic({
    root: "./web/kitsune-web-client/dist",
  }),
);

// Serve favicon with OpenAPI route and middleware
const faviconRoute = createRoute({
  method: "get",
  path: "/favicon.ico",
  tags: ["Static Assets"],
  summary: "Serve favicon",
  description: "Serves the application favicon icon",
  middleware: [
    serveStatic({
      root: "./web/kitsune-web-client/dist",
      path: "./favicon.ico",
    }),
  ] as const,
  responses: {
    200: {
      description: "Favicon file served successfully",
    },
  },
});

// Register favicon route (middleware is already configured in the route)
app.openapi(faviconRoute, (c) => {
  // The middleware handles the response
  return c.body(null);
});

// Serve the main index.html for the root route with OpenAPI documentation
const indexRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Web Application"],
  summary: "Serve main application",
  description: "Serves the main Vue.js SPA index.html file",
  middleware: [
    serveStatic({
      root: "./web/kitsune-web-client/dist",
      path: "./index.html",
    }),
  ] as const,
  responses: {
    200: {
      description: "Main application page served successfully",
    },
  },
});

// Register index route
app.openapi(indexRoute, (c) => {
  // The middleware handles the response
  return c.body(null);
});

// SPA fallback: Only catch routes that don't start with /api, /health, etc.
// Use a middleware to check the path and serve index.html for non-API routes
app.use("*", async (c, next) => {
  const path = c.req.path;

  // Don't handle API or health routes
  if (path.startsWith("/api") || path.startsWith("/health")) {
    await next();
    return;
  }

  // For all other routes, serve the Vue.js SPA
  return serveStatic({
    root: "./web/kitsune-web-client/dist",
    path: "./index.html",
  })(c, next);
});

export default app;
