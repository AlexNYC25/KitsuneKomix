import { z } from 'zod';

export const envSchema = z.object({
  MODE: z.enum(['development', 'production', 'test']),
  PORT: z.string().transform((val) => parseInt(val, 10)).default(8000),
  CLIENT_URL: z.url().default("http://localhost:5173"),

  // folder paths
  APP_CONFIG_PATH: z.string().default("/app/config"),

  // JWT secrets and settings
  JWT_SECRET: z.string().default("supersecretkey"),
  JWT_REFRESH_SECRET: z.string().default("supersecretkey_refresh"),
  
  JWT_ACCESS_TTL: z.string().transform((val) => parseInt(val, 10)).default(15 * 60), // 15 minutes
  JWT_REFRESH_TTL: z.string().transform((val) => parseInt(val, 10)).default(7 * 24 * 60 * 60), // 7 days
  
  JWT_ISSUER: z.string().default("kitsunekomix"),
  JWT_AUDIENCE: z.string().default("kitsunekomix_users"),
  
});