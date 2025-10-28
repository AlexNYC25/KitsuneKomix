import { z } from "@hono/zod-openapi";

import { comicBooksTable } from "../../../db/sqlite/schema.ts";
import { createSelectSchema } from "../../factory.ts";


export const comicBookSelectSchema: z.ZodObject =
	createSelectSchema(comicBooksTable)
		.openapi("ComicBookSelectSchema");

export const comicBookSelectJoinedWithThumbnailSchema =
	createSelectSchema(comicBooksTable)
		.extend({
			thumbnailUrl: z.string().nullable(),
		})
		.openapi("ComicBookSelectJoinedWithThumbnailSchema");


