import { z } from "@hono/zod-openapi";
import { createSelectSchema } from "drizzle-zod";

import { comicLibrariesTable } from "../../../db/sqlite/schema.ts";

export const comicLibrariesSelectSchema: z.ZodObject = createSelectSchema(
  comicLibrariesTable,
);

export const comicLibrariesArraySelectSchema = z.array(comicLibrariesSelectSchema);