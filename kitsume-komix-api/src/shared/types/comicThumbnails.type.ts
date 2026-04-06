import { z } from "zod";

import { ComicBookThumbnailSelectSchema } from "#zod/schemas/data/database.schema.ts";

export type ComicBookThumbnailItem = z.infer<typeof ComicBookThumbnailSelectSchema>;