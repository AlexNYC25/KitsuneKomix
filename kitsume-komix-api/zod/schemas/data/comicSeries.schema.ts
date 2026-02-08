import { z } from "@hono/zod-openapi";

import {
  ComicSeriesSelectSchema,
  ComicBookThumbnailSelectSchema
} from "./database.schema.ts";
import { 
  MetadataSchema 
} from "./comicMetadata.schema.ts";
import {
  ComicBookSchema
} from "./comicBooks.schema.ts";

/**
 * Schema for comic series, extending the base ComicSeriesSelectSchema with additional fields for thumbnail and metadata. This schema represents the structure of a comic series as it will be returned in API responses, including optional fields for a thumbnail image and associated metadata.
 */
export const ComicSeriesSchema = ComicSeriesSelectSchema.extend(
  {
    thumbnail: ComicBookThumbnailSelectSchema.shape.filePath.optional(),
    metadata: MetadataSchema.optional(),
    comicBooks: z.array(ComicBookSchema).optional(),
  },
).openapi({
  title: "ComicSeries",
  description: "Schema representing a comic series",
});
