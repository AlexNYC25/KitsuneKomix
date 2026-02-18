import { createRoute, OpenAPIHono } from "@hono/zod-openapi";

import { authenticateUser } from "../services/auth.service.ts";
import {
  createRefreshTokenPair,
  refreshAccessToken,
  revokeAllUserTokens,
  revokeToken,
} from "../services/refreshToken.service.ts";
import { verifyAccessToken } from "../../auth/auth.ts";

import { AuthHeaderSchema } from "#schemas/header.schema.ts";
import {
  LoginRequestSchema,
  RefreshTokenRequestSchema,
} from "#schemas/request.schema.ts";
import {
  ErrorResponseSchema,
  LoginResponseSchema,
  LogoutAllResponseSchema,
  MessageResponseSchema,
  RefreshTokenResponseSchema,
} from "#schemas/response.schema.ts";

import { AppEnv } from "#types/index.ts";

const app = new OpenAPIHono<AppEnv>();

// Register Bearer Auth security scheme for OpenAPI
app.openAPIRegistry.registerComponent("securitySchemes", "Bearer", {
  type: "http",
  scheme: "bearer",
});

/**
 * POST /api/auth/login
 *
 * Authenticate a user and return access and refresh tokens
 */
app.openapi(
  createRoute({
    method: "post",
    path: "/login",
    summary: "User login",
    description: "Authenticate a user and return access and refresh tokens",
    tags: ["Authentication"],
    request: {
      body: {
        content: {
          "application/json": {
            schema: LoginRequestSchema,
          },
        },
      },
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: LoginResponseSchema,
          },
        },
        description: "Login successful",
      },
      401: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Authentication failed",
      },
    },
  }),
  async (c) => {
    const { email, password } = c.req.valid("json");

    try {
      const user = await authenticateUser(email, password);

      // Create refresh token pair instead of just access token
      const roles = user.admin ? ["admin"] : ["user"];
      const tokenPair = await createRefreshTokenPair(user.id, roles);

      return c.json({
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          admin: user.admin,
        },
        accessToken: tokenPair.accessToken,
        refreshToken: tokenPair.refreshToken,
      }, 200);
    } catch (error: Error | unknown) {
      return c.json({ message: (error as Error).message }, 401);
    }
  },
);

/**
 * POST /api/auth/refresh-token
 *
 * Refresh the access token using a valid refresh token
 */
app.openapi(
  createRoute({
    method: "post",
    path: "/refresh-token",
    summary: "Refresh access token",
    description: "Get a new access token using a refresh token",
    tags: ["Authentication"],
    request: {
      body: {
        content: {
          "application/json": {
            schema: RefreshTokenRequestSchema,
          },
        },
      },
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: RefreshTokenResponseSchema,
          },
        },
        description: "Token refreshed successfully",
      },
      400: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Refresh token is required",
      },
      401: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Token refresh failed",
      },
    },
  }),
  async (c) => {
    try {
      const { refreshToken } = c.req.valid("json");

      if (!refreshToken) {
        return c.json({ message: "Refresh token is required" }, 400);
      }

      const newTokens = await refreshAccessToken(refreshToken);

      return c.json({
        message: "Token refreshed successfully",
        accessToken: newTokens.accessToken,
        refreshToken: newTokens.refreshToken,
      }, 200);
    } catch (error) {
      return c.json({
        message: `Token refresh failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      }, 401);
    }
  },
);

/**
 * POST /api/auth/logout
 *
 * Logout a user by revoking their refresh token
 */
app.openapi(
  createRoute({
    method: "post",
    path: "/logout",
    summary: "User logout",
    description: "Revoke a refresh token",
    tags: ["Authentication"],
    request: {
      body: {
        content: {
          "application/json": {
            schema: RefreshTokenRequestSchema,
          },
        },
      },
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: MessageResponseSchema,
          },
        },
        description: "Logout successful",
      },
      400: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Refresh token is required",
      },
      401: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Logout failed",
      },
    },
  }),
  async (c) => {
    try {
      const { refreshToken } = c.req.valid("json");

      if (!refreshToken) {
        return c.json({ message: "Refresh token is required" }, 400);
      }

      await revokeToken(refreshToken);

      return c.json({ message: "Logout successful" }, 200);
    } catch (error) {
      return c.json({
        message: `Logout failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      }, 401);
    }
  },
);

/**
 * POST /api/auth/logout-all
 *
 * Logout from all devices by revoking all refresh tokens for the authenticated user
 */
app.openapi(
  createRoute({
    method: "post",
    path: "/logout-all",
    summary: "Logout from all devices",
    description: "Revoke all refresh tokens for the authenticated user",
    tags: ["Authentication"],
    request: {
      headers: AuthHeaderSchema,
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: LogoutAllResponseSchema,
          },
        },
        description: "Logged out from all devices successfully",
      },
      401: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Unauthorized",
      },
      500: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Logout from all devices failed",
      },
    },
  }),
  async (c) => {
    try {
      // Manual auth check since middleware doesn't work well with OpenAPIHono typed routes
      const authHeader = c.req.header("Authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return c.json({ message: "Unauthorized" }, 401);
      }

      const token = authHeader.split(" ")[1];
      const payload = await verifyAccessToken(token);
      const userId = parseInt(payload.sub);

      const revokedCount = await revokeAllUserTokens(userId);

      return c.json({
        message: `Logged out from all devices successfully`,
        revokedTokens: revokedCount,
      }, 200);
    } catch (error) {
      if (
        (error as Error).message.includes("verify") ||
        (error as Error).message.includes("token")
      ) {
        return c.json({ message: "Unauthorized" }, 401);
      }
      return c.json({
        message: `Logout from all devices failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      }, 500);
    }
  },
);

export default app;
