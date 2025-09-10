import { Context, Hono } from "hono";
import { z } from "zod";

import { ComicLibrarySchema } from "../schemas/comicLibrary.schema.ts";
import { createComicLibrary } from "../db/sqlite/models/comicLibraries.model.ts";
import { LibraryRegistrationInput } from "../types/index.ts";

const app = new Hono();

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

export default app;
