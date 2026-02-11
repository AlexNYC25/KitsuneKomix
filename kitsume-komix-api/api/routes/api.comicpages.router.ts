import { createRoute, OpenAPIHono } from "@hono/zod-openapi";

import { ErrorResponseSchema } from "#schemas/response.schema.ts";
import { ParamIdSchema } from "#schemas/request.schema.ts";
import { requireAuth } from "../middleware/authChecks.ts";

import type { AppEnv, AccessRefreshTokenCombinedPayload } from "#types/index.ts";

const app = new OpenAPIHono<AppEnv>();

// Get duplicates
app.openapi(
  createRoute({
    method: "get",
    path: "/duplicates",
    summary: "Get duplicate comic pages",
    description: "Detect duplicate comic pages in the system",
    tags: ["Comic Pages"],
    middleware: [requireAuth],
    responses: {
      400: {
        content: { "application/json": { schema: ErrorResponseSchema } },
        description: "Invalid user ID",
      },
      401: {
        content: { "application/json": { schema: ErrorResponseSchema } },
        description: "Unauthorized",
      },
      501: {
        content: { "application/json": { schema: ErrorResponseSchema } },
        description: "Not implemented",
      },
    },
  }),
  (_c) => {
    const user: AccessRefreshTokenCombinedPayload | undefined = _c.get("user");

    if (!user || !user.sub) {
      return _c.json({ message: "Unauthorized" }, 401);
    }

    const userId: number = parseInt(user.sub, 10);
    if (isNaN(userId)) {
      return _c.json({ message: "Invalid user ID" }, 400);
    }

    //TODO: implement duplicate detection logic
    return _c.json({ message: "Duplicate detection not implemented yet" }, 501);
  }
);

// Get duplicates by ID
app.openapi(
  createRoute({
    method: "get",
    path: "/duplicates/{id}",
    summary: "Get duplicate for specific comic page",
    tags: ["Comic Pages"],
    middleware: [requireAuth],
    request: { params: ParamIdSchema },
    responses: {
      400: {
        content: { "application/json": { schema: ErrorResponseSchema } },
        description: "Invalid user ID",
      },
      401: {
        content: { "application/json": { schema: ErrorResponseSchema } },
        description: "Unauthorized",
      },
      501: {
        content: { "application/json": { schema: ErrorResponseSchema } },
        description: "Not implemented",
      },
    },
  }),
  (_c) => {
    const user: AccessRefreshTokenCombinedPayload | undefined = _c.get("user");

    if (!user || !user.sub) {
      return _c.json({ message: "Unauthorized" }, 401);
    }

    const userId: number = parseInt(user.sub, 10);
    if (isNaN(userId)) {
      return _c.json({ message: "Invalid user ID" }, 400);
    }

    //TODO: implement duplicate detection logic for specific comic page
    return _c.json({
      message: "Duplicate detection for comic page not implemented yet",
    }, 501);
  }
);

// Delete duplicate
app.openapi(
  createRoute({
    method: "post",
    path: "/duplicates/{id}/delete",
    summary: "Delete a duplicate comic page",
    tags: ["Comic Pages"],
    middleware: [requireAuth],
    request: { params: ParamIdSchema },
    responses: {
      400: {
        content: { "application/json": { schema: ErrorResponseSchema } },
        description: "Invalid user ID",
      },
      401: {
        content: { "application/json": { schema: ErrorResponseSchema } },
        description: "Unauthorized",
      },
      501: {
        content: { "application/json": { schema: ErrorResponseSchema } },
        description: "Not implemented",
      },
    },
  }),
  (_c) => {
    const user: AccessRefreshTokenCombinedPayload | undefined = _c.get("user");

    if (!user || !user.sub) {
      return _c.json({ message: "Unauthorized" }, 401);
    }

    const userId: number = parseInt(user.sub, 10);
    if (isNaN(userId)) {
      return _c.json({ message: "Invalid user ID" }, 400);
    }

    //TODO: implement duplicate deletion logic
    return _c.json({ message: "Duplicate deletion not implemented yet" }, 501);
  }
);

export default app;
