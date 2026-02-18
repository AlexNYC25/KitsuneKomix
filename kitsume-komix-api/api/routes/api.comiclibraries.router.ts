import { createRoute, OpenAPIHono } from "@hono/zod-openapi";

import { requireAuth } from "../middleware/authChecks.ts";

import { getComicLibrariesAvailableToUser } from "../services/comicLibraries.service.ts";

import { createComicLibrary } from "#sqlite/models/comicLibraries.model.ts";

import {
  ErrorResponseSchema,
  MessageResponseSchema,
  SuccessCreationResponseSchema,
} from "#schemas/response.schema.ts";
import {
  ComicLibrarySchema,
  PaginationSortFilterQuerySchema,
  ParamIdSchema,
} from "#schemas/request.schema.ts";
import { ComicLibrariesSchema } from "#schemas/data/comicLibraries.schema.ts";

import type {
  AccessRefreshTokenCombinedPayload,
  AppEnv,
  ComicLibrary,
  LibraryRegistrationInput,
} from "#types/index.ts";

const app = new OpenAPIHono<AppEnv>();

// Register Bearer Auth security scheme for OpenAPI
app.openAPIRegistry.registerComponent("securitySchemes", "Bearer", {
  type: "http",
  scheme: "bearer",
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
    middleware: [requireAuth],
    request: {
      query: PaginationSortFilterQuerySchema,
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: ComicLibrariesSchema,
          },
        },
        description: "Comic Libraries retrieved successfully",
      },
      400: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Invalid query parameters",
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
  }),
  async (c) => {
    const user: AccessRefreshTokenCombinedPayload | undefined = c.get("user");

    if (!user || !user.sub) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const userId: number = parseInt(user.sub, 10);
    if (isNaN(userId)) {
      return c.json({ message: "Invalid user ID" }, 400);
    }

    try {
      // TODO: Updated the validation function to handle comic libraries
      //const serviceData: RequestParametersValidated<ComicSortField, ComicFilterField> = validateAndBuildQueryParams(queryData, "comicLibraries");

      const libraries: ComicLibrary[] = await getComicLibrariesAvailableToUser(
        userId,
      );
      return c.json(
        { libraries },
        200,
      );
    } catch (error) {
      console.error("Error retrieving comic libraries for user:", error);
      return c.json({ message: "Internal server error" }, 500);
    }
  },
);

/**
 * GET /api/comic-libraries/{id}
 *
 * Get a specific comic library by its ID.
 * The user must have access to the library.
 */
app.openapi(
  createRoute({
    method: "get",
    path: "/{id}",
    summary: "Get a specific comic library",
    description: "Get a comic library by its ID",
    tags: ["Comic Libraries"],
    middleware: [requireAuth],
    request: {
      params: ParamIdSchema,
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: MessageResponseSchema,
          },
        },
        description: "Library retrieved successfully",
      },
      400: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Invalid library ID",
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
  }),
  async (c) => {
    const id = parseInt(c.req.valid("param").id, 10);

    const user: AccessRefreshTokenCombinedPayload | undefined = c.get("user");

    if (!user || !user.sub) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const userId: number = parseInt(user.sub, 10);
    if (isNaN(userId)) {
      return c.json({ message: "Invalid user ID" }, 400);
    }

    try {
      // TODO: use user.id and id to get the library from the database
      return c.json({
        message: `Library[${id}] for user ${userId} retrieved successfully`,
      }, 200);
    } catch (error) {
      console.error("Error retrieving comic library for user:", error);
      return c.json({ message: "Internal server error" }, 500);
    }
  },
);

/**
 * POST /api/comic-libraries/{id}/analyze
 *
 * Start analysis of a comic library.
 */
app.openapi(
  createRoute({
    method: "post",
    path: "/{id}/analyze",
    summary: "Analyze a comic library",
    description: "Start analysis of a comic library",
    tags: ["Comic Libraries"],
    middleware: [requireAuth],
    request: {
      params: ParamIdSchema,
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: MessageResponseSchema,
          },
        },
        description: "Library analysis started successfully",
      },
      400: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Invalid library ID",
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
  }),
  async (c) => {
    const id = parseInt(c.req.valid("param").id, 10);

    const user: AccessRefreshTokenCombinedPayload | undefined = c.get("user");

    if (!user || !user.sub) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const userId: number = parseInt(user.sub, 10);
    if (isNaN(userId)) {
      return c.json({ message: "Invalid user ID" }, 400);
    }

    try {
      // TODO: use user.id and id to analyze the library
      return c.json(
        { message: `Library[${id}] analysis started for user ${user.id}` },
        200,
      );
    } catch (error) {
      console.error("Error starting analysis for comic library:", error);
      return c.json({ message: "Internal server error" }, 500);
    }
  },
);

/**
 * POST /api/comic-libraries/{id}/empty-trash
 *
 * Empty the trash for a specific comic library.
 */
app.openapi(
  createRoute({
    method: "post",
    path: "/{id}/empty-trash",
    summary: "Empty trash for a library",
    description: "Empty the trash for a specific comic library",
    tags: ["Comic Libraries"],
    middleware: [requireAuth],
    request: {
      params: ParamIdSchema,
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: MessageResponseSchema,
          },
        },
        description: "Library trash emptied successfully",
      },
      400: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Invalid library ID",
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
  }),
  async (c) => {
    const id = parseInt(c.req.valid("param").id, 10);

    const user: AccessRefreshTokenCombinedPayload | undefined = c.get("user");

    if (!user || !user.sub) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const userId: number = parseInt(user.sub, 10);
    if (isNaN(userId)) {
      return c.json({ message: "Invalid user ID" }, 400);
    }

    try {
      // TODO: use user.id and id to empty the trash for the library
      return c.json(
        { message: `Library[${id}] trash emptied for user ${user.id}` },
        200,
      );
    } catch (error) {
      console.error("Error emptying trash for comic library:", error);
      return c.json({ message: "Internal server error" }, 500);
    }
  },
);

/**
 * POST /api/comic-libraries/create-library
 *
 * Create a new comic library in the system.
 */
app.openapi(
  createRoute({
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
    },
    responses: {
      201: {
        content: {
          "application/json": {
            schema: SuccessCreationResponseSchema,
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
  }),
  async (c) => {
    const user: AccessRefreshTokenCombinedPayload | undefined = c.get("user");

    if (!user || !user.sub) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const userId: number = parseInt(user.sub, 10);
    if (isNaN(userId)) {
      return c.json({ message: "Invalid user ID" }, 400);
    }

    try {
      const requestData = c.req.valid("json");
      const parsed = ComicLibrarySchema.safeParse(requestData);

      if (!parsed.success) {
        return c.json({
          message: "Invalid library data",
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
        success: true,
        "id": newLibraryId,
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
  },
);

/**
 * DELETE /api/comic-libraries/delete-library/{id}
 *
 * Delete a comic library from the system.
 */
app.openapi(
  createRoute({
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
      400: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Invalid library ID",
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
  }),
  async (c) => {
    const id = parseInt(c.req.valid("param").id, 10);

    const user: AccessRefreshTokenCombinedPayload | undefined = c.get("user");

    if (!user || !user.sub) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const userId: number = parseInt(user.sub, 10);
    if (isNaN(userId)) {
      return c.json({ message: "Invalid user ID" }, 400);
    }

    try {
      // TODO: use user.id and id to delete the library from the database
      return c.json(
        { message: `Library[${id}] deleted for user ${user.id}` },
        200,
      );
    } catch (error) {
      console.error("Error deleting comic library:", error);
      return c.json({ message: "Internal server error" }, 500);
    }
  },
);

export default app;
