import { envSchema } from "@/zod/env.schema";

export const env = envSchema.parse(import.meta.env);