import { z } from "zod";

import { ComicSeriesGroupSelectSchema } from "#zod/schemas/data/database.schema.ts";
import { ComicSeriesSchema } from "#zod/schemas/data/comicSeries.schema.ts";

/**
 * Schema for a comic collection (comic series group with associated comic books and metadata).
 */
export const ComicCollectionSchemaMetadata = z.object({
  totalNumberOfComicSeries: z.number().default(0),
  totalSizeOfCollection: z.number().default(0),
  numberOfComicSeriesWithComicsReadByUser: z.number().default(0),
  numberOfComicSeriesWithComicsBeingReadByUser: z.number().default(0),
});

export const ComicCollectionSchema = ComicSeriesGroupSelectSchema
  .extend(ComicCollectionSchemaMetadata.shape)
  .extend({ comicSeries: ComicSeriesSchema.array() });