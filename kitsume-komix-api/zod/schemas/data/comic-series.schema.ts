import { z } from "@hono/zod-openapi";
import { createSelectSchema } from "drizzle-zod";

import { 
  comicBookSelectJoinedWithThumbnailSchema,
  comicBookSelectJoinedWithThumbnailCamelCaseSchema 
} from "./comic-books.schema.ts";
import { metadataSchema } from "./comic-metadata.schema.ts";
import { toCamelCaseSchema } from "../../utils/openapi-helpers.ts";

import { comicSeriesTable } from "../../../db/sqlite/schema.ts";

/**
 * Schemas for comic series
 * 
 * Direct schema from the comicSeriesTable
 */
export const comicSeriesSelectSchema: z.ZodObject = createSelectSchema(
  comicSeriesTable,
);

/**
 * Schema for comic series joined with their thumbnail URL
 * 
 * Extends the base comic series schema with a nullable thumbnailUrl field
 */
export const comicSeriesSelectJoinedWithThumbnailSchema = createSelectSchema(
  comicSeriesTable,
).extend({
  thumbnailUrl: z.string().nullable().optional(),
});

/**
 * CamelCase version for OpenAPI compatibility of the comic series with thumbnail schema
 */
export const comicSeriesSelectJoinedWithThumbnailCamelCaseSchema = toCamelCaseSchema(
  comicSeriesSelectJoinedWithThumbnailSchema,
  {
    title: "ComicSeriesWithThumbnail",
    description: "A comic series with its thumbnail URL in camelCase format",
  }
);

/**
 * Schema for comic series joined with their thumbnail URL and metadata
 * 
 * Extends the base comic series schema with a nullable thumbnailUrl field and metadata
 */
export const comicSeriesSelectJoinedWithThumbnailAndMetadataSchema =
  comicSeriesSelectJoinedWithThumbnailSchema.extend({
    metadata: z.union([
      metadataSchema,
      z.record(z.string(), z.undefined()),
    ]),
  });

/**
 * Schema for comic series joined with their thumbnails, metadata, and associated comics
 * 
 * Extends the comic series with thumbnail and metadata schema to include an array of comics
 */
export const comicSeriesSelectJoinedWithThumbnailsMetadataAndComicsSchema =
  comicSeriesSelectJoinedWithThumbnailAndMetadataSchema.extend({
    comics: z.array(
      comicBookSelectJoinedWithThumbnailSchema,
    ),
  });


/**
 * Explicit camelCase schema for series with comics, metadata, and thumbnails for OpenAPI compatibility
 * 
 * manual copy of the comicSeriesSelectJoinedWithThumbnailsMetadataAndComicsSchema schema with camelCase keys due
 * to complexity in converting the properties from snake_case to camelCase automatically
 */
export const comicSeriesSelectJoinedWithThumbnailsMetadataAndComicsCamelCaseSchema = z.object({
  id: z.number().openapi({ example: 1 }),
  name: z.string().openapi({ example: "Example Series" }),
  description: z.string().nullable().openapi({ example: "A comic series" }),
  folderPath: z.string().openapi({ example: "/path/to/series" }),
  createdAt: z.string().openapi({ example: "2024-01-01T00:00:00Z" }),
  updatedAt: z.string().openapi({ example: "2024-01-01T00:00:00Z" }),
  thumbnailUrl: z.string().nullable().optional().openapi({ example: "/api/image/thumbnail.jpg" }),
  metadata: metadataSchema.optional(),
  comics: z.array(comicBookSelectJoinedWithThumbnailCamelCaseSchema).openapi({
    description: "Array of comic books in this series",
  }),
}).openapi({
  title: "ComicSeriesWithComicsMetadataAndThumbnails",
  description: "A comic series with its metadata, thumbnail, and associated comic books in camelCase format",
});
