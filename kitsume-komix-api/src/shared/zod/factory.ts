import { z } from "@hono/zod-openapi";
import { createSchemaFactory } from "drizzle-zod";

export const { createSelectSchema, createInsertSchema } = createSchemaFactory({ zodInstance: z });

