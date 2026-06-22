import { z } from 'zod';

export const dbEnvSchema = z.object({
  DB_PATH: z.string().default("/app/data/config/database.sqlite"),
  LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "fatal"]).default("info"),
  APP_CONFIG_PATH: z.string().default("/app/data/config"),
  PAGE_SIZE: z.string().transform((val) => parseInt(val, 10)).default(20),
});
