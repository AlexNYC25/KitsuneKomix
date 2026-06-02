import { z } from "zod";

import { ComicStoryArcSelectSchema } from "#zod/schemas/data/database.schema.ts";
import { ComicBookWithMetadataSchema } from "#zod/schemas/data/comicBooks.schema.ts";

/**
 * Schema for a read list (comic story arc with associated comic books and metadata).
 */
export const ReadListSchemaMetadata = z.object({
  totalNumberOfComics: z.number().default(0),
  totalSizeOfStoryArc: z.number().default(0),
  numberOfComicsReadByUser: z.number().default(0),
  numberOfComicsBeingReadByUser: z.number().default(0),
});

export const ReadListSchema = ComicStoryArcSelectSchema
  .extend(ReadListSchemaMetadata.shape)
  .extend({ comicBooks: ComicBookWithMetadataSchema.array() });