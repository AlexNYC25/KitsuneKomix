import { Context, Hono } from "hono";
import { serveStatic } from "hono/deno";

// Router to serve the Vue.js production build from dist folder

const app = new Hono();

// Serve static assets (CSS, JS, images) with proper cache headers
app.use(
	"/assets/*",
	serveStatic({
		root: "./web/kitsune-web-client/dist",
	})
);

// Serve other static files (favicon, etc.)
app.use(
	"/*",
	serveStatic({
		root: "./web/kitsune-web-client/dist",
	})
);

// Fallback for SPA routing - serve index.html for any unmatched routes
app.get("*", serveStatic({
	root: "./web/kitsune-web-client/dist",
	path: "./index.html",
}));

export default app;