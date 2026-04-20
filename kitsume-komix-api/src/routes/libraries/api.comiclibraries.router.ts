import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { z } from "zod";

import { requireAuth } from "#modules/auth/middleware/authChecks.ts";
import { getComicLibrariesAvailableToUser } from "#modules/libraries/comicLibraries.service.ts";
import { listFoldersInDirectoryService } from "#modules/files/files.service.ts";

import { createComicLibrary, deleteComicLibrary, updateComicLibrary } from "#infrastructure/db/sqlite/models/comicLibraries.model.ts";

import {
  ErrorResponseSchema,
  MessageResponseSchema,
  SuccessCreationResponseSchema,
} from "#zod/schemas/response.schema.ts";
import {
  ComicLibraryResponseSchema,
  PaginationSortFilterQuerySchema,
  ParamIdSchema,
} from "#zod/schemas/request.schema.ts";
import { ComicLibraryCreateSchema, ComicLibraryUpdateSchema } from "#zod/schemas/data/comicLibraries.schema.ts";

import type {
  AccessRefreshTokenCombinedPayload,
  AppEnv,
  ComicLibrary,
  LibraryRegistrationInput,
  LibraryUpdateInput,
  LibraryCompiledInfo
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
            schema: ComicLibraryResponseSchema
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

      const libraries: LibraryCompiledInfo[] = await getComicLibrariesAvailableToUser(
        userId,
      );

      return c.json(
        { "libraries": libraries },
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
 * 
 * NOTE: Not functional yet, maybe remove?
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
 * 
 * NOTE: Not functional yet, in next stage when enabling/disabling libraries takes a larger approach
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
            schema: ComicLibraryCreateSchema,
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
      403: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Forbidden",
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

    if (!user.isAdmin) {
      return c.json({ message: "Forbidden" }, 403);
    }

    const userId: number = parseInt(user.sub, 10);
    if (isNaN(userId)) {
      return c.json({ message: "Invalid user ID" }, 400);
    }

    try {
      const requestData = c.req.valid("json");
      const parsed = ComicLibraryCreateSchema.safeParse(requestData);

      if (!parsed.success) {
        return c.json({
          message: "Invalid library data",
          errors: z.treeifyError(parsed.error),
        }, 400);
      }

      const newLibraryId = await createComicLibrary(parsed.data as LibraryRegistrationInput);

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
 * POST /api/comic-libraries/update-library/{id}
 *
 * Update a comic library in the system.
 */
app.openapi(
  createRoute({
    method: "post",
    path: "/update-library/{id}",
    summary: "Update a comic library",
    description: "Update a comic library in the system",
    tags: ["Comic Libraries"],
    middleware: [requireAuth],
    request: {
      params: ParamIdSchema,
      body: {
        content: {
          "application/json": {
            schema: ComicLibraryUpdateSchema,
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
        description: "Library updated successfully",
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
      403: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Forbidden",
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

    if (!user.isAdmin) {
      return c.json({ message: "Forbidden: User does not have admin privileges" }, 403);
    }

    try {
      const id = parseInt(c.req.valid("param").id, 10);
      if (isNaN(id)) {
        return c.json({ message: "Invalid library ID" }, 400);
      }

      const requestData = c.req.valid("json");
      const parsed = ComicLibraryUpdateSchema.safeParse(requestData);

      if (!parsed.success) {
        return c.json({
          message: "Invalid library data",
          errors: z.treeifyError(parsed.error),
        }, 400);
      }

      const updatedSuccessfully = await updateComicLibrary(id, parsed.data as LibraryUpdateInput);

      if (!updatedSuccessfully) {
        return c.json({ message: `Library[${id}] not found or could not be updated` }, 400);
      }

      return c.json(
        { message: `Library[${id}] updated for user ${userId}` },
        200,
      );
    } catch (error ) {
      console.error("Error updating comic library:", error);
      return c.json({ message: "Internal server error" }, 500);
    }
  }
)

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
      403: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Forbidden",
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

    if (!user.isAdmin) {
      return c.json({ message: "Forbidden: User does not have admin privileges" }, 403);
    }

    try {
      const id = parseInt(c.req.valid("param").id, 10);
      if (isNaN(id)) {
        return c.json({ message: "Invalid library ID" }, 400);
      }

      const deletionSucceded = await deleteComicLibrary(id);

      if (!deletionSucceded) {
        return c.json({ message: `Library[${id}] not found or could not be deleted` }, 400);
      }

      return c.json(
        { message: `Library[${id}] deleted for user ${userId}` },
        200,
      );
    } catch (error) {
      console.error("Error deleting comic library:", error);
      return c.json({ message: "Internal server error" }, 500);
    }
  },
);


/**
 * POST /api/comic-libraries/find-path
 * 
 * Used for the process of registering a new comic library in the system.
 * The client sends a request to this path optionally with a file path, if not falls back to the
 * default comics directory 
 */
app.openapi(
  createRoute({
    method: "post",
    path: "/find-path",
    summary: "Find a comic library path",
    description: "Find a comic library path in the system",
    tags: ["Comic Libraries"],
    middleware: [requireAuth],
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              path: z.string().optional(),
            }),
          },
        },
      },
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: z.object({
              directories: z.array(z.string()),
            }),
          },
        },
        description: "Library path found successfully",
      },
      400: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Invalid library path data",
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
      const listedDirectories = await listFoldersInDirectoryService(c.req.valid("json").path);
      return c.json(
        { directories: listedDirectories },
        200,
      );
    } catch (error) {
      if (error instanceof Error && error.message.startsWith("Invalid path")) {
        return c.json({ message: error.message }, 400);
      }
      return c.json({ message: "Internal server error" }, 500); 
    }
  },
);

export default app;
