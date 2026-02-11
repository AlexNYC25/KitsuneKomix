import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { apiLogger } from "../../logger/loggers.ts";
import { existsSync } from "@std/fs";
import { join } from "@std/path";
import { requireAuth } from "../middleware/authChecks.ts";

import type { AppEnv, AccessRefreshTokenCombinedPayload } from "#types/index.ts";
import { ErrorResponseSchema, ImageResponseSchema } from "#schemas/response.schema.ts";
import { ParamImagePathSchema, ParamComicPageImageSchema } from "#schemas/request.schema.ts";

const imageRouter = new OpenAPIHono<AppEnv>();

const CACHE_DIRECTORY = "/app/cache"; // Ensure this matches your actual cache directory TODO: move to config

/**
 * GET /image/thumbnails/:imagePath
 *
 * example: /image/thumbnails/daa25f429c0da574fddec515c0aefb581d7079afa2c55dae7a07955800152ef7_thumb.jpg
 * or example: /image/thumbnails/custom/daa25f429c0da574fddec515c0aefb581d7079afa2c55dae7a07955800152ef7_thumb.jpg
 */
imageRouter.openapi(
  createRoute(
    {
      method: "get",
      path: "/thumbnails/{imagePath}",
      summary: "Get thumbnail image",
      description: "Retrieve a thumbnail image from the cache directory.",
      tags: ["Images"],
      middleware: [requireAuth],
      request: {
        params: ParamImagePathSchema,
      },
      responses: {
        200: {
          description: "The thumbnail image",
          content: {
            "image/jpeg": {
              schema: ImageResponseSchema,
            },
            "image/png": {
              schema: ImageResponseSchema,
            },
          },
        },
        400: {
          description: "Bad Request - Invalid user ID",
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
        404: {
          description: "Image not found",
          content: {
            "application/json": {
              schema: ErrorResponseSchema,
            },
          },
        },
        500: {
          description: "Internal Server Error",
          content: {
            "application/json": {
              schema: ErrorResponseSchema,
            },
          },
        },
      },
    },
  ),
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
      const { imagePath }: { imagePath: string } = c.req.valid("param");

      // Construct the full thumbnail path
      const thumbnailPath: string = join(CACHE_DIRECTORY, "thumbnails", imagePath);

      apiLogger.info(`Attempting to serve thumbnail: ${thumbnailPath}`);

      // Check if file exists
      if (!existsSync(thumbnailPath)) {
        apiLogger.warn(`Thumbnail not found: ${thumbnailPath}`);
        return c.json({ error: "Image not found" }, 404);
      }

      // Determine content type based on file extension
      const ext: string | undefined = imagePath.toLowerCase().split(".").pop();
      const contentType: string = ext === "png" ? "image/png" : "image/jpeg";

      // Read and serve the file
      const fileContent = await Deno.readFile(thumbnailPath);

      return new Response(fileContent, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000", // Cache for 1 year
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : String(error);
      apiLogger.error(`Error serving thumbnail: ${errorMessage}`);
      return c.json({ error: "Failed to serve image" }, 500);
    }
  },
);

/**
 * GET /image/comic-book/:comicId/page/:imagePath
 *
 * example: /image/comic-book/42/page/page_1.jpg
 * Retrieves a comic book page image from the cache/pages/{comicId}/ directory
 */
imageRouter.openapi(
  createRoute(
    {
      method: "get",
      path: "/comic-book/{comicId}/page/{imagePath}",
      summary: "Get comic book page image",
      description: "Retrieve a comic book page image from the cache directory.",
      tags: ["Images"],
      middleware: [requireAuth],
      request: {
        params: ParamComicPageImageSchema,
      },
      responses: {
        200: {
          description: "The comic book page image",
          content: {
            "image/jpeg": {
              schema: ImageResponseSchema,
            },
            "image/png": {
              schema: ImageResponseSchema,
            },
            "image/webp": {
              schema: ImageResponseSchema,
            },
          },
        },
        400: {
          description: "Bad Request - Invalid user ID",
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
        404: {
          description: "Image not found",
          content: {
            "application/json": {
              schema: ErrorResponseSchema,
            },
          },
        },
        500: {
          description: "Internal Server Error",
          content: {
            "application/json": {
              schema: ErrorResponseSchema,
            },
          },
        },
      },
    },
  ),
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
      const { comicId, imagePath }: { comicId: string; imagePath: string } = c.req.valid("param");

      // Construct the full page image path: cache/pages/{comicId}/{imagePath}
      const pagePath: string = join(CACHE_DIRECTORY, "pages", comicId, imagePath);

      apiLogger.info(`Attempting to serve comic page: ${pagePath}`);

      // Check if file exists
      if (!existsSync(pagePath)) {
        apiLogger.warn(`Comic page not found: ${pagePath}`);
        return c.json({ error: "Image not found" }, 404);
      }

      // Determine content type based on file extension
      const ext: string | undefined = imagePath.toLowerCase().split(".").pop();
      let contentType: string = "image/jpeg";
      if (ext === "png") {
        contentType = "image/png";
      } else if (ext === "webp") {
        contentType = "image/webp";
      }

      // Read and serve the file
      const fileContent = await Deno.readFile(pagePath);

      return new Response(fileContent, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000", // Cache for 1 year
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : String(error);
      apiLogger.error(`Error serving comic page: ${errorMessage}`);
      return c.json({ error: "Failed to serve image" }, 500);
    }
  },
);

export default imageRouter;
