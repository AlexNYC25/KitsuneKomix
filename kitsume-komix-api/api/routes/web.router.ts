import { Context, Hono } from "hono";
import { serveStatic } from "hono/deno";

// Router to serve the Vue.js production build from dist folder

const app = new Hono();

// Serve static assets (CSS, JS, images) with proper cache headers
app.use(
  "/assets/*",
  serveStatic({
    root: "./web/kitsune-web-client/dist",
  }),
);

// Serve specific static files (favicon, etc.) - be more specific to avoid catching API routes
app.get(
  "/favicon.ico",
  serveStatic({
    root: "./web/kitsune-web-client/dist",
    path: "./favicon.ico",
  }),
);

app.get(
  "/vite.svg",
  serveStatic({
    root: "./web/kitsune-web-client/dist",
    path: "./vite.svg",
  }),
);

// Serve the main index.html for the root route
app.get(
  "/",
  serveStatic({
    root: "./web/kitsune-web-client/dist",
    path: "./index.html",
  }),
);

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
