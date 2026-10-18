import { z } from 'zod';
import { sharedEnvSchema } from './shared.schema';

export const serverEnvSchema = sharedEnvSchema.extend({
  PORT: z
		.string()
		.transform((val) => parseInt(val, 10))
		.default(8000),
	HOST: z.string().default("0.0.0.0"),

  BETTER_AUTH_SECRET: z
		.string()
		.default("dev-insecure-better-auth-secret-change-me"),
	BETTER_AUTH_URL: z.url().default("http://localhost:8001"),

  HONKER_LIB_PATH: z.string().default("/honker/libhonker_ext.so"),
	DB_FILE_NAME: z.string().default("database.sqlite"),
	SQLITE_BUSY_TIMEOUT: z.coerce.number().default(5000),

	PAGE_SIZE: z.number().default(20),

	LIBRARY_SCAN_INTERVAL: z.number().default(3_000),
})