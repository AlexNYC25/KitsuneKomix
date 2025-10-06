import { ZodSafeParseResult } from "zod";
import { z, createRoute, OpenAPIHono } from "@hono/zod-openapi";

import { UserSchema } from "../../schemas/user.schema.ts";
import { UserRegistrationInput } from "../../types/index.ts";
import { createUserService, assignLibraryToUserService } from "../services/users.service.ts";

const apiUsersRouter = new OpenAPIHono();

apiUsersRouter.openapi(
  createRoute({
    method: "post",
    path: "/create-user",
    summary: "Create a new user",
    description: "Endpoint to create a new user in the system.",
    tags: ["Users"],
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
            schema: z.object({
              message: z.string(),
              userId: z.number(),
            }),
          },
        },
      },
      400: {
        description: "Invalid user data",
        content: {
          "application/json": {
            schema: z.object({
              message: z.string(),
              errors: z.record(z.string(), z.any()).optional(),
            }),
          },
        },
      },
      500: {
        description: "Internal server error",
        content: {
          "application/json": {
            schema: z.object({
              message: z.string(),
            }),
          },
        },
      },
    },
  }),
  async (c) => {
    try {
      const userData: UserRegistrationInput = await c.req.json();
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

apiUsersRouter.openapi(
  createRoute({
    method: "post",
    path: "/assign-library",
    summary: "Assign library to user",
    description: "Endpoint to assign a library to a user. Requires authentication.",
    tags: ["Users"],
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              userId: z.number().int().positive(),
              libraryId: z.number().int().positive(),
            }),
          },
        },
      },
    },
    responses: {
      200: {
        description: "Library assigned successfully",
        content: {
          "application/json": {
            schema: z.object({
              message: z.string(),
            }),
          },
        },
      },
      400: {
        description: "Invalid request data",
        content: {
          "application/json": {
            schema: z.object({
              message: z.string(),
            }),
          },
        },
      },
      401: {
        description: "Unauthorized",
        content: {
          "application/json": {
            schema: z.object({
              message: z.string(),
            }),
          },
        },
      },
      500: {
        description: "Internal server error",
        content: {
          "application/json": {
            schema: z.object({
              message: z.string(),
            }),
          },
        },
      },
    },
  }),
  async (c) => {
    // Check authentication
    const authHeader = c.req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json({ message: "Unauthorized" }, 401);
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

export default apiUsersRouter;
