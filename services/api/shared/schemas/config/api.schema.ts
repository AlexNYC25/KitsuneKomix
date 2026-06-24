import { z } from "zod";

export const apiSchema = z.object({
  MODE: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform((val) => parseInt(val, 10)).default(8000),
  HOST: z.string().default("0.0.0.0"),
  CLIENT_URL: z.url().default("http://localhost:5173"), // Maybe replace with just the port and always use localhost

  COMICS_DIRECTORY: z.string().default("/app/data/comics"),
  APP_CACHE_PATH: z.string().default("/app/data/cache"),
  CONFIG_DIRECTORY: z.string().default("/app/data/config")
})