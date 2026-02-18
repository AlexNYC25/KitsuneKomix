import { createRoute, OpenAPIHono } from "@hono/zod-openapi";

import { requireAuth } from "../middleware/authChecks.ts";

import { purgeAllData } from "#sqlite/models/admin.model.ts";

import { MessageResponseSchema } from "#schemas/response.schema.ts";

import { AccessRefreshTokenCombinedPayload, AppEnv } from "#types/index.ts";

const app = new OpenAPIHono<AppEnv>();

// Register Bearer Auth security scheme for OpenAPI
app.openAPIRegistry.registerComponent("securitySchemes", "Bearer", {
  type: "http",
  scheme: "bearer",
});

app.openapi(
  createRoute({
    method: "post",
    path: "/purge-data",
    summary: "Purge all data",
    description: "Delete all data from the system (admin only)",
    tags: ["Admin"],
    middleware: [requireAuth],
    responses: {
      200: {
        content: {
          "application/json": {
            schema: MessageResponseSchema,
          },
        },
        description: "All data purged successfully",
      },
      400: {
        content: {
          "application/json": {
            schema: MessageResponseSchema,
          },
        },
        description: "Invalid user ID",
      },
      401: {
        content: {
          "application/json": {
            schema: MessageResponseSchema,
          },
        },
        description: "Unauthorized",
      },
      500: {
        content: {
          "application/json": {
            schema: MessageResponseSchema,
          },
        },
        description: "Internal server error",
      },
    },
  }),
  async (c) => {
    const user: AccessRefreshTokenCombinedPayload | undefined = c.get("user");

    // TODO: Add additional check to verify that the user has admin privileges before allowing data purge

    if (!user || !user.sub) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const userId: number = parseInt(user.sub, 10);
    if (isNaN(userId)) {
      return c.json({ message: "Invalid user ID" }, 400);
    }

    try {
      await purgeAllData();
      return c.json({ message: "All data purged successfully" }, 200);
    } catch (error) {
      console.error("Error purging data:", error);
      return c.json({ message: "Internal server error" }, 500);
    }
  },
);

export default app;
