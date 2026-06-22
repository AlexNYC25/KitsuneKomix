import { dbEnvSchema } from "./env.schema.ts";

export const env = dbEnvSchema.parse(Deno.env.toObject());
