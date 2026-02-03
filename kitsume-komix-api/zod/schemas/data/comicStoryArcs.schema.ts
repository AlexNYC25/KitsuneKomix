import { z } from "@hono/zod-openapi";
import { createSelectSchema } from "drizzle-zod";

import { comicStoryArcsTable } from "../../../db/sqlite/schema.ts";

/**
 * Schemas for comic story arcs
 * 
 * Direct schema from the comicStoryArcsTable
 */
export const comicStoryArcSelectSchema: z.ZodObject = createSelectSchema(
  comicStoryArcsTable,
);