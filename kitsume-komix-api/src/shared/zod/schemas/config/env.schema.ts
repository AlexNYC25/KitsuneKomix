import { z } from 'zod';

export const envSchema = z.object({
  MODE: z.enum(['development', 'production', 'test']),
  PORT: z.string().transform((val) => parseInt(val, 10)).default(8000),
  CLIENT_URL: z.url().default("http://localhost:5173"),

  // folder paths
  APP_CONFIG_PATH: z.string().default("/app/config"),
  APP_CACHE_PATH: z.string().default("/app/cache"),

  // JWT secrets and settings
  JWT_SECRET: z.string().default("supersecretkey"),
  JWT_REFRESH_SECRET: z.string().default("supersecretkey_refresh"),
  
  JWT_ACCESS_TTL: z.string().transform((val) => parseInt(val, 10)).default(15 * 60), // 15 minutes
  JWT_REFRESH_TTL: z.string().transform((val) => parseInt(val, 10)).default(7 * 24 * 60 * 60), // 7 days
  
  JWT_ISSUER: z.string().default("kitsunekomix"),
  JWT_AUDIENCE: z.string().default("kitsunekomix_users"),

  // Cookie settings
  ACCESS_COOKIE_NAME: z.string().default("kk_access_token"),
  REFRESH_COOKIE_NAME: z.string().default("kk_refresh_token"),
  ACCESS_COOKIE_MAX_AGE_SECONDS: z.string().transform((val) => parseInt(val, 10)).default(18000), // 5 hours
  REFRESH_COOKIE_MAX_AGE_SECONDS: z.string().transform((val) => parseInt(val, 10)).default(604800), // 7 days
  COOKIE_DOMAIN: z.string().optional(),
  COOKIE_PATH: z.string().default("/"),
  REFRESH_COOKIE_PATH: z.string().default("/api/auth"),
  COOKIE_HTTP_ONLY: z.string().transform((val) => val.toLowerCase() === "true").default(true),
  COOKIE_SECURE: z.string().transform((val) => val.toLowerCase() === "true").default(true),
  COOKIE_SAME_SITE: z.enum(["Lax", "Strict", "None"]).default("Lax"),
  
  // Pagination settings
  PAGE_SIZE: z.string().transform((val) => parseInt(val, 10)).default(20),
  PAGE_NUMBER: z.string().transform((val) => parseInt(val, 10)).default(1),
  FILTER_SORT: z.enum(["asc", "desc"]).default("asc"),
});