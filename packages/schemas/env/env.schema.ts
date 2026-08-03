import { z } from "zod";

export const envSchema = z.object({
  MODE: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform((val) => parseInt(val, 10)).default(8000),
  HOST: z.string().default("0.0.0.0"),
  CLIENT_URL: z.url().default("http://localhost:5173"), // Maybe replace with just the port and always use localhost

  COMICS_DIRECTORY: z.string().default("/app/data/comics"),
  APP_CACHE_PATH: z.string().default("/app/data/cache"),
  CONFIG_DIRECTORY: z.string().default("/app/data/config"),

  LOG_LEVEL: z.string().default("info"),

  HONKER_LIB_PATH: z.string().default("/honker/libhonker_ext.so"),
  DB_FILE_NAME: z.string().default("database.sqlite"),

  PAGE_SIZE: z.number().default(20),

  LIBRARY_SCAN_INTERVAL: z.number().default(3_000)

})