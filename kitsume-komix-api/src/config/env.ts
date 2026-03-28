import { envSchema } from "#zod/schemas/config/env.schema.ts";

export const env = envSchema.parse(Deno.env.toObject());