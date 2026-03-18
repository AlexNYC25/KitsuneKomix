import type { Context, Next } from "hono";

import { verifyAccessToken, verifyRefreshToken } from "../auth/auth.ts";
import { getValidRefreshToken } from "../../db/sqlite/models/refreshTokens.model.ts";
import { apiLogger } from "../../logger/loggers.ts";
import type { AccessRefreshTokenCombinedPayload } from "#types/index.ts";
import { getTokenFromCookie } from "../services/auth.service.ts";
import { ACCESS_COOKIE_NAME } from "#utilities/environment.ts";

/**
 * Middleware to require authentication for a route.
 * @param c - The context object.
 * @param next - The next middleware function.
 * @returns A response indicating whether the user is authenticated.
 */
export const requireAuth = async (c: Context, next: Next) => {
  const authHeader: string | undefined = c.req.header("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({
      message: "Unauthorized - Missing or invalid Authorization header",
    }, 401);
  }

  const token: string = authHeader.split(" ")[1];

  try {
    const payload: AccessRefreshTokenCombinedPayload = await verifyAccessToken(
      token,
    );
    c.set("user", payload);
    return next();
  } catch (error) {
    apiLogger.error(
      `Token verification failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    return c.json({ message: "Unauthorized" }, 401);
  }
};

/**
 * Alias for requireAuth. Use on routes that must only accept Bearer token auth.
 * All existing routes using requireAuth continue to work via this name too.
 */
export const requireTokenAuth = requireAuth;

/**
 * Middleware to require authentication via HttpOnly access-token cookie.
 * Use on browser-facing routes that rely on cookie-based sessions.
 * Rejects requests that carry a Bearer header instead of a cookie.
 * @param c - The context object.
 * @param next - The next middleware function.
 * @returns A response indicating whether the user is authenticated.
 */
export const requireCookieAuth = async (c: Context, next: Next) => {
  const token = getTokenFromCookie(c, ACCESS_COOKIE_NAME);
  if (!token) {
    return c.json({ message: "Unauthorized - Missing session cookie" }, 401);
  }

  try {
    const payload: AccessRefreshTokenCombinedPayload = await verifyAccessToken(token);
    c.set("user", payload);
    return next();
  } catch (error) {
    apiLogger.error(
      `Cookie token verification failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    return c.json({ message: "Unauthorized" }, 401);
  }
};

/**
 * Middleware to require admin role for a route.
 * @param c - The context object.
 * @param next - The next middleware function.
 * @returns A response indicating whether the user has admin privileges.
 */
export const requireAdmin = async (c: Context, next: Next) => {
  const user = c.get("user") as { id: string; roles: string[] } | undefined;
  if (!user || !user.roles || !user.roles.includes("admin")) {
    return c.json({ message: "Forbidden" }, 403);
  }
  await next();
};

/**
 * Middleware to validate refresh tokens for token refresh endpoints.
 * This middleware validates both the JWT signature and database storage.
 * @param c - The context object.
 * @param next - The next middleware function.
 * @returns A response indicating whether the refresh token is valid.
 */
export const requireValidRefreshToken = async (c: Context, next: Next) => {
  try {
    const body = await c.req.json();
    const refreshToken = body.refreshToken;

    if (!refreshToken) {
      return c.json({ message: "Refresh token is required" }, 400);
    }

    // Verify JWT signature and structure
    const payload = await verifyRefreshToken(refreshToken);

    // Verify token exists and is valid in database
    const storedToken = await getValidRefreshToken(payload.jti);
    if (!storedToken) {
      return c.json({ message: "Invalid or expired refresh token" }, 401);
    }

    // Set the verified payload in context for use in the route handler
    c.set("refreshTokenPayload", payload);
    c.set("storedRefreshToken", storedToken);

    // Reset the body for the route handler to read
    c.req.bodyCache = body;

    return next();
  } catch (error) {
    apiLogger.error(
      `Refresh token validation failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    return c.json({ message: "Invalid refresh token" }, 401);
  }
};
