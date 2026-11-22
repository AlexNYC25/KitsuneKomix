import { z } from "zod";

export const dbSchema = z.object({
  DATABASE_URL: z.url().default("database.sqlite")
});

export type DbConfig = z.output<typeof dbSchema>