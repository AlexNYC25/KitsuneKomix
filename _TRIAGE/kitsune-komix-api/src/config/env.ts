import { z } from "zod";

import { dbEnvSchema } from "#database/config/env.schema.ts";

const apiSchema = z.object({
  MODE: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform((val) => parseInt(val, 10)).default(8000),
  HOST: z.string().default("0.0.0.0"),
  CLIENT_URL: z.url().default("http://localhost:5173"),

  COMICS_DIRECTORY: z.string().default("/app/data/comics"),
  APP_CACHE_PATH: z.string().default("/app/data/cache"),

  JWT_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  PAGE_NUMBER: z.string().transform((val) => parseInt(val, 10)).default(1),
  FILTER_SORT: z.enum(["asc", "desc"]).default("asc"),
  JWT_ACCESS_TTL: z.string().transform((val) => parseInt(val, 10)).default(15 * 60),
  JWT_REFRESH_TTL: z.string().transform((val) => parseInt(val, 10)).default(7 * 24 * 60 * 60),
  JWT_ISSUER: z.string().default("kitsunekomix"),
  JWT_AUDIENCE: z.string().default("kitsunekomix_users"),

  ACCESS_COOKIE_NAME: z.string().default("kk_access_token"),
  REFRESH_COOKIE_NAME: z.string().default("kk_refresh_token"),
  ACCESS_COOKIE_MAX_AGE_SECONDS: z.string().transform((val) => parseInt(val, 10)).default(18000),
  REFRESH_COOKIE_MAX_AGE_SECONDS: z.string().transform((val) => parseInt(val, 10)).default(604800),
  COOKIE_DOMAIN: z.string().optional(),
  COOKIE_PATH: z.string().default("/"),
  REFRESH_COOKIE_PATH: z.string().default("/api/auth"),
  COOKIE_HTTP_ONLY: z.string().transform((val) => val.toLowerCase() === "true").default(true),
  COOKIE_SECURE: z.string().transform((val) => val.toLowerCase() === "true").default(true),
  COOKIE_SAME_SITE: z.enum(["Lax", "Strict", "None"]).default("Lax"),

  SUPPORTED_COMIC_FORMATS: z.enum([".cbz", ".cbr", "cb7", ".zip", ".rar", ".7z"]).array().default([".cbz", ".cbr", "cb7", ".zip", ".rar", ".7z"]),
  SUPPORTED_IMAGE_FORMATS: z.enum([".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".tiff", ".tif"]).array().default([".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"]),

  METADATA_CACHE_TTL_MS: z.string().transform((val) => parseInt(val, 10)).default(60 * 60 * 1000),
  CACHE_PAGES_DIR: z.string().default("./cache/pages"),
  CACHE_THUMBNAILS_DIR: z.string().default("./cache/thumbnails/custom"),
  LARGE_FILE_THRESHOLD_BYTES: z.coerce.number().default(104857600),
});

export const envSchema = dbEnvSchema.extend(apiSchema.shape);
export const env = envSchema.parse(Deno.env.toObject());
