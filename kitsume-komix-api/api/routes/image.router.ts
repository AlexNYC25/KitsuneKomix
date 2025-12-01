import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { apiLogger } from "../../logger/loggers.ts";
import { existsSync } from "@std/fs";
import { join } from "@std/path";

const imageRouter = new OpenAPIHono();

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
      request: {
        params: z.object({
          imagePath: z.string().describe(
            "The path to the image (can include subdirectories)",
          ),
        }),
      },
      responses: {
        200: {
          description: "The thumbnail image",
          content: {
            "image/jpeg": {
              schema: z.any(),
            },
            "image/png": {
              schema: z.any(),
            },
          },
        },
        404: {
          description: "Image not found",
          content: {
            "application/json": {
              schema: z.object({
                error: z.string(),
              }),
            },
          },
        },
      },
    },
  ),
  async (c) => {
    try {
      const { imagePath } = c.req.valid("param");

      // Construct the full thumbnail path
      const thumbnailPath = join(CACHE_DIRECTORY, "thumbnails", imagePath);

      apiLogger.info(`Attempting to serve thumbnail: ${thumbnailPath}`);

      // Check if file exists
      if (!existsSync(thumbnailPath)) {
        apiLogger.warn(`Thumbnail not found: ${thumbnailPath}`);
        return c.json({ error: "Image not found" }, 404);
      }

      // Determine content type based on file extension
      const ext = imagePath.toLowerCase().split(".").pop();
      const contentType = ext === "png" ? "image/png" : "image/jpeg";

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
      request: {
        params: z.object({
          comicId: z.string().describe("The ID of the comic book"),
          imagePath: z.string().describe(
            "The name of the page image file",
          ),
        }),
      },
      responses: {
        200: {
          description: "The comic book page image",
          content: {
            "image/jpeg": {
              schema: z.any(),
            },
            "image/png": {
              schema: z.any(),
            },
            "image/webp": {
              schema: z.any(),
            },
          },
        },
        404: {
          description: "Image not found",
          content: {
            "application/json": {
              schema: z.object({
                error: z.string(),
              }),
            },
          },
        },
      },
    },
  ),
  async (c) => {
    try {
      const { comicId, imagePath } = c.req.valid("param");

      // Construct the full page image path: cache/pages/{comicId}/{imagePath}
      const pagePath = join(CACHE_DIRECTORY, "pages", comicId, imagePath);

      apiLogger.info(`Attempting to serve comic page: ${pagePath}`);

      // Check if file exists
      if (!existsSync(pagePath)) {
        apiLogger.warn(`Comic page not found: ${pagePath}`);
        return c.json({ error: "Image not found" }, 404);
      }

      // Determine content type based on file extension
      const ext = imagePath.toLowerCase().split(".").pop();
      let contentType = "image/jpeg";
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
