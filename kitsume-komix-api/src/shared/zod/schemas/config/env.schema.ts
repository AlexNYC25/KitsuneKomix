import { z } from 'zod';

export const envSchema = z.object({
  MODE: z.enum(['development', 'production', 'test']),
  PORT: z.string().transform((val) => parseInt(val, 10)).default(8000),
  CLIENT_URL: z.url().default("http://localhost:5173"),

  // folder paths
  APP_CONFIG_PATH: z.string().default("/app/config"),
});