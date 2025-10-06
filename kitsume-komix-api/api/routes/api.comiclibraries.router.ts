import { z, createRoute, OpenAPIHono } from "@hono/zod-openapi";

import { ComicLibrarySchema } from "../../schemas/comicLibrary.schema.ts";
import { createComicLibrary } from "../../db/sqlite/models/comicLibraries.model.ts";
import { LibraryRegistrationInput } from "../../types/index.ts";
import { verifyAccessToken } from "../../auth/auth.ts";

const app = new OpenAPIHono();

// Response Schemas
const MessageResponseSchema = z.object({
  message: z.string(),
});

const LibraryResponseSchema = z.object({
  message: z.string(),
  libraryId: z.number(),
});

const ErrorResponseSchema = z.object({
  message: z.string(),
  errors: z.record(z.string(), z.any()).optional(),
});

const ParamIdSchema = z.object({
  id: z.string().openapi({
    param: {
      name: 'id',
      in: 'path',
    },
    example: '1',
  }),
});

const AuthHeaderSchema = z.object({
  authorization: z.string().openapi({ 
    example: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    description: "Bearer token for authentication"
  }),
});

/*
  Get the comic libraries that are in the system but that the current user has access to.
  admins can see all libraries, regular users only those they have been granted access to.
*/
const getLibrariesRoute = createRoute({
  method: "get",
  path: "/",
  summary: "Get all comic libraries",
  description: "Get the comic libraries that the current user has access to. Admins can see all libraries, regular users only those they have been granted access to.",
  tags: ["Comic Libraries"],
  request: {
    headers: AuthHeaderSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: MessageResponseSchema,
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
});

app.openapi(getLibrariesRoute, async (c) => {
  // Manual auth check
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  try {
    const token = authHeader.split(" ")[1];
    await verifyAccessToken(token);
    
    // TODO: use the model/service to get the libraries from the database
    return c.json({ message: "Comic Libraries API is running" }, 200);
  } catch (_error) {
    return c.json({ message: "Unauthorized" }, 401);
  }
});

const getLibraryRoute = createRoute({
  method: "get",
  path: "/{id}",
  summary: "Get a specific comic library",
  description: "Get a comic library by its ID",
  tags: ["Comic Libraries"],
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
  },
});

app.openapi(getLibraryRoute, (c) => {
  const { id } = c.req.valid("param");
  // TODO: use the model/service to get the library from the database
  return c.json({ message: `Library[${id}] retrieved successfully` }, 200);
});

const analyzeLibraryRoute = createRoute({
  method: "patch",
  path: "/{id}/analyze",
  summary: "Analyze a comic library",
  description: "Start analysis of a comic library",
  tags: ["Comic Libraries"],
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
  },
});

app.openapi(analyzeLibraryRoute, (c) => {
  const { id } = c.req.valid("param");
  // TODO: use the model/service to analyze the library
  return c.json(
    { message: `Library[${id}] analysis started successfully` },
    200,
  );
});

const emptyTrashRoute = createRoute({
  method: "post",
  path: "/{id}/empty-trash",
  summary: "Empty trash for a library",
  description: "Empty the trash for a specific comic library",
  tags: ["Comic Libraries"],
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
  },
});

app.openapi(emptyTrashRoute, (c) => {
  const { id } = c.req.valid("param");
  // TODO: use the model/service to empty the trash for the library
  return c.json({ message: `Library[${id}] trash emptied successfully` }, 200);
});

const createLibraryRoute = createRoute({
  method: "post",
  path: "/create-library",
  summary: "Create a new comic library",
  description: "Create a new comic library in the system",
  tags: ["Comic Libraries"],
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
          schema: LibraryResponseSchema,
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
    };
    const newLibraryId = await createComicLibrary(libraryData);

    return c.json({
      message: `Library[${parsed.data.name}] registered successfully`,
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

const deleteLibraryRoute = createRoute({
  method: "delete",
  path: "/delete-library/{id}",
  summary: "Delete a comic library",
  description: "Delete a comic library from the system",
  tags: ["Comic Libraries"],
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
  },
});

app.openapi(deleteLibraryRoute, (c) => {
  const { id } = c.req.valid("param");
  // TODO: use the model/service to delete the library from the database
  return c.json({ message: `Library[${id}] deleted successfully` }, 200);
});

export default app;
