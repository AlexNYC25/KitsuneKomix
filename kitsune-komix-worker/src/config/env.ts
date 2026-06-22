import { z } from "zod";

const workerSchema = z.object({
  MODE: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),

  COMICS_DIRECTORY: z.string().default("/app/data/comics"),
  CONFIG_DIRECTORY: z.string().default("/app/data/config"),

  SQLITE_DB_PATH: z.string().default("/app/data/database.sqlite"),
});

export const env = workerSchema.parse(Deno.env.toObject());