import { z } from "zod";

export const dbSchema = z.object({
  DATABASE_URL: z.url().default("database.sqlite")
});