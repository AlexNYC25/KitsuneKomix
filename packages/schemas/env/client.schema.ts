import { z } from 'zod';
import { sharedEnvSchema } from './shared.schema';

export const clientEnvSchema = sharedEnvSchema.extend({
  CLIENT_URL: z.url().default("http://localhost:5173"), // Maybe replace with just the port and always use localhost
});