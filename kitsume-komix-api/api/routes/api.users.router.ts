import { ZodSafeParseResult } from "zod";
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";

import { requireAuth } from "../middleware/authChecks.ts";
import {
  assignLibraryToUserService,
  createUserService,
  deleteUserService,
} from "../services/users.service.ts";

import {
  ParamIdSchema,
  ParamUserLibraryIdSchema,
  UserSchema,
} from "#schemas/request.schema.ts";
import { AuthHeaderSchema } from "#schemas/header.schema.ts";
import {
  ErrorResponseSchema,
  MessageResponseSchema,
  UserCreationResponseSchema,
} from "#schemas/response.schema.ts";

import {
  AccessRefreshTokenCombinedPayload,
  AppEnv,
  UserRegistrationInput,
} from "#types/index.ts";

const apiUsersRouter = new OpenAPIHono<AppEnv>();

// Register Bearer Auth security scheme for OpenAPI
apiUsersRouter.openAPIRegistry.registerComponent("securitySchemes", "Bearer", {
  type: "http",
  scheme: "bearer",
});

apiUsersRouter.openapi(
  createRoute({
    method: "post",
    path: "/create-user",
    summary: "Create a new user",
    description: "Endpoint to create a new user in the system.",
    tags: ["Users"],
    middleware: [requireAuth],
    request: {
      body: {
        content: {
          "application/json": {
            schema: UserSchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: "User created successfully",
        content: {
          "application/json": {
            schema: UserCreationResponseSchema,
          },
        },
      },
      400: {
        description: "Invalid user data",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
      401: {
        description: "Unauthorized - User must be logged in",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
      500: {
        description: "Internal server error",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
    },
  }),
  async (c) => {
    try {
      const userData: UserRegistrationInput = await c.req.json();

      const user: AccessRefreshTokenCombinedPayload | undefined = c.get("user");

      if (!user || !user.sub) {
        return c.json({ message: "Unauthorized" }, 401);
      }

      const userId: number = parseInt(user.sub, 10);
      if (isNaN(userId)) {
        return c.json({ message: "Invalid user ID" }, 400);
      }

      const parsed: ZodSafeParseResult<UserRegistrationInput> = UserSchema
        .safeParse(userData);

      if (!parsed.success) {
        return c.json({
          message: "Invalid user data",
          errors: z.treeifyError(parsed.error),
        }, 400);
      }

      // Use the service layer to handle user creation logic
      const newUserId = await createUserService(parsed.data);

      return c.json({
        message: `User[${parsed.data.email}] created successfully`,
        userId: newUserId,
      }, 201);
    } catch (error) {
      console.error("Error parsing JSON or creating user:", error);
      if (error instanceof SyntaxError && error.message.includes("JSON")) {
        return c.json({ message: "Invalid JSON format in request body" }, 400);
      }
      return c.json({ message: "Internal server error" }, 500);
    }
  },
);

/**
 * POST /api/users/assign-library
 * Assign a comic library to a user
 */
apiUsersRouter.openapi(
  createRoute({
    method: "post",
    path: "/assign-library",
    summary: "Assign library to user",
    description:
      "Endpoint to assign a library to a user. Requires authentication.",
    tags: ["Users"],
    middleware: [requireAuth],
    request: {
      body: {
        content: {
          "application/json": {
            schema: ParamUserLibraryIdSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Library assigned successfully",
        content: {
          "application/json": {
            schema: MessageResponseSchema,
          },
        },
      },
      400: {
        description: "Invalid request data",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
      401: {
        description: "Unauthorized",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
      500: {
        description: "Internal server error",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
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
      // TODO: expand the possiblility of assigning multiple libraries at once
      const { userId, libraryId } = await c.req.json();

      // Validate input
      if (!userId || !libraryId) {
        return c.json({ message: "User ID and Library ID are required" }, 400);
      }

      // Call the service to assign the library to the user
      await assignLibraryToUserService(userId, libraryId);

      return c.json({ message: "Library assigned to user successfully" }, 200);
    } catch (error) {
      console.error("Error assigning library to user:", error);
      return c.json({ message: "Internal server error" }, 500);
    }
  },
);

/**
 * POST /api/users/assign-library/:id
 * Assigns a comic library to a user, identified by the library id in the URL parameter.
 * With the user id found by the authenticated token.
 * Requires authentication.
 */
apiUsersRouter.openapi(
  createRoute({
    method: "post",
    path: "/assign-library/:id",
    summary: "Assign library to authenticated user",
    description:
      "Assign a comic library to the authenticated user. Requires authentication.",
    tags: ["Users"],
    request: {
      params: ParamIdSchema,
    },
    middleware: [requireAuth],
    responses: {
      200: {
        description: "Library assigned successfully",
        content: {
          "application/json": {
            schema: MessageResponseSchema,
          },
        },
      },
      400: {
        description: "Invalid request data",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
      401: {
        description: "Unauthorized",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
      500: {
        description: "Internal server error",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
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

    const paramId = c.req.param("id");
    const libraryId = parseInt(paramId, 10);

    if (isNaN(libraryId) || libraryId <= 0) {
      return c.json({ message: "Invalid library ID" }, 400);
    }

    try {
      await assignLibraryToUserService(userId, libraryId);
    } catch (error) {
      console.error("Error assigning library to user:", error);
      return c.json({ message: "Internal server error" }, 500);
    }

    return c.json({ message: "Library assigned to user successfully" }, 200);
  },
);

/**
 * DELETE /api/users/delete-user/
 * Deletes the currently authenticated user.
 */
apiUsersRouter.openapi(
  createRoute({
    method: "delete",
    path: "/delete-user",
    summary: "Delete the currently authenticated user",
    description: "Deletes the currently authenticated user.",
    tags: ["Users"],
    middleware: [requireAuth],
    request: {
      headers: AuthHeaderSchema,
    },
    responses: {
      200: {
        description: "User deleted successfully",
        content: {
          "application/json": {
            schema: MessageResponseSchema,
          },
        },
      },
      400: {
        description: "Invalid user ID",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
      401: {
        description: "Unauthorized",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
      500: {
        description: "Internal server error",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
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
      await deleteUserService(userId);
    } catch (error) {
      console.error("Error deleting user:", error);
      return c.json({ message: "Error deleting user" }, 500);
    }

    return c.json({ message: "User deleted successfully" }, 200);
  },
);

/**
 * DELETE /api/delete-user/:id
 * Deletes a user by ID. Requires admin privileges or the user themselves.
 *
 * Ideally should just be for the admin user to delete other users, but allowing
 * users to delete their own account for now.
 */
apiUsersRouter.openapi(
  createRoute({
    method: "delete",
    path: "/delete-user/:id",
    summary: "Delete a user",
    description: "Delete a user from the system. Requires authentication.",
    tags: ["Users"],
    middleware: [requireAuth],
    request: {
      params: ParamIdSchema,
    },
    responses: {
      200: {
        description: "User deleted successfully",
        content: {
          "application/json": {
            schema: MessageResponseSchema,
          },
        },
      },
      400: {
        description: "Invalid user ID",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
      401: {
        description: "Unauthorized",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
      500: {
        description: "Internal server error",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
    },
  }),
  async (c) => {
    const paramId = c.req.param("id");
    const user: AccessRefreshTokenCombinedPayload | undefined = c.get("user");

    if (!user || !user.sub) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const userId: number = parseInt(user.sub, 10);
    if (isNaN(userId)) {
      return c.json({ message: "Invalid user ID" }, 400);
    }

    const deleteUserId = parseInt(paramId, 10);

    if (isNaN(deleteUserId) || deleteUserId <= 0) {
      return c.json({ message: "Invalid user ID" }, 400);
    }

    // Only allow users to delete their own account or admins (TODO: implement admin check)
    if (userId !== deleteUserId) {
      return c.json({ message: "Unauthorized to delete this user" }, 401);
    }

    try {
      await deleteUserService(deleteUserId);
    } catch (error) {
      console.error("Error deleting user:", error);
      return c.json({ message: "Error deleting user" }, 500);
    }

    return c.json({ message: "User deleted successfully" }, 200);
  },
);

export default apiUsersRouter;
