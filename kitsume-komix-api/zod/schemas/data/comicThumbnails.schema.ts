import { z } from "@hono/zod-openapi";
import { createSelectSchema } from "drizzle-zod";

import { comicBookThumbnails } from "../../../db/sqlite/schema.ts";

export const comicBookThumbnailSchema = createSelectSchema(
  comicBookThumbnails,
).openapi({
  title: "ComicBookThumbnail",
  description: "Schema representing a comic book thumbnail",
});