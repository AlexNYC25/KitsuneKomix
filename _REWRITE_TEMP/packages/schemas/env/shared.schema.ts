import { z } from 'zod';

export const sharedEnvSchema = z.object({
  MODE: z.enum(["development", "production", "test"]).default("development"),

  LOG_LEVEL: z.string().default("info"),

  COMICS_DIRECTORY: z.string().default("/app/data/comics"),
	APP_CACHE_PATH: z.string().default("/app/data/cache"),
	CONFIG_DIRECTORY: z.string().default("/app/data/config"),
});