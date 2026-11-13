import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";

import { auth } from "../../utils/auth";
import type { ApiEnv } from "../types";

/**
 * Resolves the current session for the request and stores the user/session in
 * Hono context. Runs on all /api/* routes so handlers can read the
 * authenticated user via `c.get("user")` / `c.get("session")`.
 *
 * Skips better-auth's own handler routes (/api/auth/*), which resolve the
 * session themselves.
 */
export const resolveAuthSession = createMiddleware<ApiEnv>(async (c, next) => {
	if (c.req.path.startsWith("/api/auth/")) {
		return next();
	}

	const session = await auth.api.getSession({
		headers: c.req.raw.headers,
	});

	c.set("user", session?.user ?? null);
	c.set("session", session?.session ?? null);

	return next();
});

/**
 * Guards a route so only authenticated users can access it.
 * Requires `resolveAuthSession` to have run (global on /api/*).
 */
export const requireAuth = createMiddleware<ApiEnv>(async (c, next) => {
	if (!c.get("session")) {
		throw new HTTPException(401, { message: "Unauthorized" });
	}

	return next();
});

/**
 * Guards a route so only admin users can access it.
 * Requires `resolveAuthSession` to have run (global on /api/*).
 */
export const requireAdmin = createMiddleware<ApiEnv>(async (c, next) => {
	if (!c.get("user")?.isAdmin) {
		throw new HTTPException(403, { message: "Forbidden" });
	}

	return next();
});
