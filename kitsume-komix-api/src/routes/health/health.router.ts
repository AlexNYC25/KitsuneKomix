import { createRoute, OpenAPIHono } from "@hono/zod-openapi";

import { HealthCheckResponseSchema } from "#zod/schemas/response.schema.ts";

import { appMeta } from "#config/appMeta.ts";

import { testRedisConnection } from "#infrastructure/db/redis/client.ts";
import { testSQLiteConnection } from "#infrastructure/db/sqlite/client.ts";

const healthRouter = new OpenAPIHono();

healthRouter.openapi(
  createRoute({
    method: "get",
    path: "/",
    summary: "Health check",
    tags: ["Root"],
    responses: {
      200: {
        content: { "application/json": { schema: HealthCheckResponseSchema } },
        description: "Health check",
      },
      503: {
        content: { "application/json": { schema: HealthCheckResponseSchema } },
        description: "Service Unavailable - Health check failed",
      },
    },
  }),
  async (c) => {
    // Check SQLite connection
    const sqliteHealthy = await testSQLiteConnection();

    // Check Redis connection
    const redisHealthy = await testRedisConnection();

    if (!sqliteHealthy || !redisHealthy) {
      return c.json(
        {
          message: "Health check failed",
          status: "error" as const,
          details: {
            sqlite: (sqliteHealthy ? "ok" : "failed") as "ok" | "failed",
            redis: (redisHealthy ? "ok" : "failed") as "ok" | "failed",
          },
        },
        503,
      );
    }

    return c.json({
      message: "Kitsune Komix API is healthy",
      status: "ok" as const,
      app: {
        name: appMeta.name,
        version: appMeta.version,
        description: appMeta.description,
      },
    }, 200);
  },
);

export default healthRouter;
