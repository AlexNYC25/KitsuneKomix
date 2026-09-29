import { z } from "zod";

export const envSchema = z.object({
  MODE: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform((val) => parseInt(val, 10)).default(8000),
  HOST: z.string().default("0.0.0.0"),
  CLIENT_URL: z.url().default("http://localhost:5173"), // Maybe replace with just the port and always use localhost

  BETTER_AUTH_SECRET: z.string().default("dev-insecure-better-auth-secret-change-me"),
  BETTER_AUTH_URL: z.url().default("http://localhost:8001"),

  COMICS_DIRECTORY: z.string().default("/app/data/comics"),
  APP_CACHE_PATH: z.string().default("/app/data/cache"),
  CONFIG_DIRECTORY: z.string().default("/app/data/config"),

  LOG_LEVEL: z.string().default("info"),

  HONKER_LIB_PATH: z.string().default("/honker/libhonker_ext.so"),
  DB_FILE_NAME: z.string().default("database.sqlite"),
  SQLITE_BUSY_TIMEOUT: z.coerce.number().default(5000),

  PAGE_SIZE: z.number().default(20),

  LIBRARY_SCAN_INTERVAL: z.number().default(3_000),

  JWT_SECRET: z.string().default("dev-insecure-jwt-secret-change-me"),
  JWT_REFRESH_SECRET: z.string().default("dev-insecure-jwt-refresh-secret-change-me"),
  ACCESS_TOKEN_TTL_MINUTES: z.coerce.number().default(60),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().default(30),
  AUTH_CLEANUP_INTERVAL_MS: z.coerce.number().default(3_600_000),
})