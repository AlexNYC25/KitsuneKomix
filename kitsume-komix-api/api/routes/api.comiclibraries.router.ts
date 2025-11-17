import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";

import { requireAuth } from "../middleware/authChecks.ts";

import { createComicLibrary } from "../../db/sqlite/models/comicLibraries.model.ts";
import { getComicLibrariesAvailableToUser } from "../services/comicLibraries.service.ts";

import { ComicLibrarySchema } from "../../schemas/comicLibrary.schema.ts";
import {
  ErrorResponseSchema,
  LibraryResponseSchema,
  CreateLibraryResponseSchema,
} from "../../zod/schemas/response.schema.ts";
import { AuthHeaderSchema } from "../../zod/schemas/header.schema.ts";
import type { AppEnv, LibraryRegistrationInput } from "../../types/index.ts";

const app = new OpenAPIHono<AppEnv>();

// Register Bearer Auth security scheme for OpenAPI
app.openAPIRegistry.registerComponent("securitySchemes", "Bearer", {
  type: "http",
  scheme: "bearer",
});

// Response Schemas
const MessageResponseSchema = z.object({
  message: z.string(),
});

const ParamIdSchema = z.object({
  id: z.string().openapi({
    param: {
      name: "id",
      in: "path",
    },
    example: "1",
  }),
});

/**
 * GET /api/comic-libraries/
 *
 * Get the comic libraries that are in the system but that the current user has access to.
 * admins can see all libraries, regular users only those they have been granted access to.
 */
app.openapi(
  createRoute({
    method: "get",
    path: "/",
    summary: "Get all comic libraries",
    description:
      "Get the comic libraries that the current user has access to. Admins can see all libraries, regular users only those they have been granted access to.",
    tags: ["Comic Libraries"],
    request: {
      headers: AuthHeaderSchema,
    },
    middleware: [requireAuth],
    security: [
      { Bearer: [] },
    ],
    responses: {
      200: {
        content: {
          "application/json": {
            schema: LibraryResponseSchema,
          },
        },
        description: "Comic Libraries retrieved successfully",
      },
      401: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Unauthorized",
      },
    },
  }),
  async (c) => {
    const user = c.get("user");
    if (!user) {
      return c.json(
        { message: "Unauthorized" },
        401,
      );
    }
    const userId = parseInt(user.sub, 10);

    // Get the libraries for the user from the database
    const libraries = await getComicLibrariesAvailableToUser(userId);
    return c.json(
      { message: "Comic Libraries retrieved successfully", data: libraries },
      200,
    );
  },
);

/**
 * GET /api/comic-libraries/{id}
 *
 * Get a specific comic library by its ID.
 * The user must have access to the library.
 */
const getLibraryRoute = createRoute({
  method: "get",
  path: "/{id}",
  summary: "Get a specific comic library",
  description: "Get a comic library by its ID",
  tags: ["Comic Libraries"],
  request: {
    params: ParamIdSchema,
  },
  security: [
    { Bearer: [] },
  ],
  responses: {
    200: {
      content: {
        "application/json": {
          schema: MessageResponseSchema,
        },
      },
      description: "Library retrieved successfully",
    },
    401: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Unauthorized",
    },
  },
});

app.openapi(getLibraryRoute, (c) => {
  const { id } = c.req.valid("param");
  const user = c.get("user");
  if (!user) {
    return c.json({ message: "Unauthorized" }, 401);
  }
  // TODO: use user.id and id to get the library from the database
  return c.json({
    message: `Library[${id}] for user ${user.id} retrieved successfully`,
  }, 200);
});

/**
 * PATCH /api/comic-libraries/{id}/analyze
 *
 * Start analysis of a comic library.
 */
const analyzeLibraryRoute = createRoute({
  method: "patch",
  path: "/{id}/analyze",
  summary: "Analyze a comic library",
  description: "Start analysis of a comic library",
  tags: ["Comic Libraries"],
  request: {
    params: ParamIdSchema,
  },
  security: [
    { Bearer: [] },
  ],
  responses: {
    200: {
      content: {
        "application/json": {
          schema: MessageResponseSchema,
        },
      },
      description: "Library analysis started successfully",
    },
    401: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Unauthorized",
    },
  },
});

app.openapi(analyzeLibraryRoute, (c) => {
  const { id } = c.req.valid("param");
  const user = c.get("user");
  if (!user) {
    return c.json({ message: "Unauthorized" }, 401);
  }
  // TODO: use user.id and id to analyze the library
  return c.json(
    { message: `Library[${id}] analysis started for user ${user.id}` },
    200,
  );
});

/**
 * POST /api/comic-libraries/{id}/empty-trash
 *
 * Empty the trash for a specific comic library.
 */
const emptyTrashRoute = createRoute({
  method: "post",
  path: "/{id}/empty-trash",
  summary: "Empty trash for a library",
  description: "Empty the trash for a specific comic library",
  tags: ["Comic Libraries"],
  request: {
    params: ParamIdSchema,
  },
  security: [
    { Bearer: [] },
  ],
  responses: {
    200: {
      content: {
        "application/json": {
          schema: MessageResponseSchema,
        },
      },
      description: "Library trash emptied successfully",
    },
    401: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Unauthorized",
    },
  },
});

app.openapi(emptyTrashRoute, (c) => {
  const { id } = c.req.valid("param");
  const user = c.get("user");
  if (!user) {
    return c.json({ message: "Unauthorized" }, 401);
  }
  // TODO: use user.id and id to empty the trash for the library
  return c.json(
    { message: `Library[${id}] trash emptied for user ${user.id}` },
    200,
  );
});

/**
 * POST /api/comic-libraries/create-library
 *
 * Create a new comic library in the system.
 */
const createLibraryRoute = createRoute({
  method: "post",
  path: "/create-library",
  summary: "Create a new comic library",
  description: "Create a new comic library in the system",
  tags: ["Comic Libraries"],
  middleware: [requireAuth],
  request: {
    body: {
      content: {
        "application/json": {
          schema: ComicLibrarySchema,
        },
      },
    },
    headers: AuthHeaderSchema,
  },
  security: [
    { Bearer: [] },
  ],
  responses: {
    201: {
      content: {
        "application/json": {
          schema: CreateLibraryResponseSchema,
        },
      },
      description: "Library created successfully",
    },
    400: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Invalid library data",
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
      description: "Internal server error",
    },
  },
});

app.openapi(createLibraryRoute, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ message: "Unauthorized" }, 401);
  }
  try {
    const requestData = c.req.valid("json");
    const parsed = ComicLibrarySchema.safeParse(requestData);

    if (!parsed.success) {
      return c.json({
        message: "Invalid library data",
        errors: z.treeifyError(parsed.error),
      }, 400);
    }

    // Use the service layer to handle library registration logic
    // Convert null description to undefined to match LibraryRegistrationInput type
    const libraryData: LibraryRegistrationInput = {
      ...parsed.data,
      description: parsed.data.description || undefined,
      // Optionally associate with user.id if needed
      // userId: user.id,
    };
    const newLibraryId = await createComicLibrary(libraryData);

    return c.json({
      message: `Library[${parsed.data.name}] registered for user ${user.id}`,
      libraryId: newLibraryId,
    }, 201);
  } catch (error) {
    console.error("Error parsing JSON or registering library:", error);
    if (error instanceof SyntaxError && error.message.includes("JSON")) {
      return c.json(
        { message: "Invalid JSON format in request body" },
        400,
      );
    }
    return c.json({ message: "Internal server error" }, 500);
  }
});

/**
 * DELETE /api/comic-libraries/delete-library/{id}
 *
 * Delete a comic library from the system.
 */
const deleteLibraryRoute = createRoute({
  method: "delete",
  path: "/delete-library/{id}",
  summary: "Delete a comic library",
  description: "Delete a comic library from the system",
  tags: ["Comic Libraries"],
  request: {
    params: ParamIdSchema,
  },
  security: [
    { Bearer: [] },
  ],
  responses: {
    200: {
      content: {
        "application/json": {
          schema: MessageResponseSchema,
        },
      },
      description: "Library deleted successfully",
    },
    401: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Unauthorized",
    },
  },
});

app.openapi(deleteLibraryRoute, (c) => {
  const { id } = c.req.valid("param");
  const user = c.get("user");
  if (!user) {
    return c.json({ message: "Unauthorized" }, 401);
  }
  // TODO: use user.id and id to delete the library from the database
  return c.json({ message: `Library[${id}] deleted for user ${user.id}` }, 200);
});

export default app;
