import { Context } from "hono";
import { ZodSafeParseResult } from "zod";

import { ComicLibrarySchema } from "../schemas/comicLibrary.schema.ts";
import { LibraryRegistrationInput } from "../types/comicLibrary.type.ts";
import { registerComicLibrary } from "../services/comicLibraries.service.ts";

export const comicLibraryController = {
  registerLibrary: async (c: Context) => {
    try {
      const libraryData: LibraryRegistrationInput = await c.req.json();
      const parsed: ZodSafeParseResult<LibraryRegistrationInput> =
        ComicLibrarySchema.safeParse(libraryData);

      if (!parsed.success) {
        return c.json({
          message: "Invalid library data",
          errors: parsed.error.flatten(),
        }, 400);
      }

      // Use the service layer to handle library registration logic
      const newLibraryId = registerComicLibrary(parsed.data);

      return c.json({
        message: `Library[${parsed.data.name}] registered successfully`,
        libraryId: newLibraryId,
      }, 201);
    } catch (error) {
      console.error("Error parsing JSON or registering library:", error);
      if (error instanceof SyntaxError && error.message.includes("JSON")) {
        return c.json({ message: "Invalid JSON format in request body" }, 400);
      }
      return c.json({ message: "Internal server error" }, 500);
    }
  },
};
