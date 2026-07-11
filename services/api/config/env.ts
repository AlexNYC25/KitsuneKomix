import { envSchema } from "kitsune-komix-schemas";

export const env = envSchema.parse(process.env);