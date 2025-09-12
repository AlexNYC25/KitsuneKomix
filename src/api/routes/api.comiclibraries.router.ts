import { Context, Hono } from "hono";
import { z } from "zod";

import { ComicLibrarySchema } from "../schemas/comicLibrary.schema.ts";
import { createComicLibrary } from "../db/sqlite/models/comicLibraries.model.ts";
import { LibraryRegistrationInput } from "../types/index.ts";

const app = new Hono();

app.get("/", async (c: Context) => {
  // TODO: use the model/service to get the libraries from the database
  return c.json({ message: "Comic Libraries API is running" }, 200);
});

app.get("/:id", async (c: Context) => {
  const id = c.req.param("id");
  // TODO: use the model/service to get the library from the database
  return c.json({ message: `Library[${id}] retrieved successfully` }, 200);
});

app.patch('/:id/analyze', async (c: Context) => {
  const id = c.req.param("id");
  // TODO: use the model/service to analyze the library
  return c.json({ message: `Library[${id}] analysis started successfully` }, 200);
});

app.post('/:id/empty-trash', async (c: Context) => {
  const id = c.req.param("id");
  // TODO: use the model/service to empty the trash for the library
  return c.json({ message: `Library[${id}] trash emptied successfully` }, 200);
});

app.post(
  "/create-library",
  async (c: Context) => {
    try {
      const requestData = await c.req.json();
      const parsed = ComicLibrarySchema.safeParse(requestData);

      if (!parsed.success) {
        return c.json({
          message: "Invalid library data",
          errors: z.treeifyError(parsed.error),
        }, 400);
      }

      try {
        const requestData = await c.req.json();
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
    } catch (error) {
      console.error("Error parsing JSON or registering library:", error);
      if (error instanceof SyntaxError && error.message.includes("JSON")) {
        return c.json({ message: "Invalid JSON format in request body" }, 400);
      }
      return c.json({ message: "Internal server error" }, 500);
    }
  },
);

app.delete("/delete-library/:id", async (c: Context) => {
  const id = c.req.param("id");

  // TODO: use the model/service to delete the library from the database

  return c.json({ message: `Library[${id}] deleted successfully` }, 200);
});


export default app;
