import { z } from "zod";
import { createSchemaFactory } from "drizzle-zod";

export const { createSelectSchema, createInsertSchema } = createSchemaFactory({ zodInstance: z });

