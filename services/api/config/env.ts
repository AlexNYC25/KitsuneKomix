import { apiSchema } from "#schemas/config/api.schema.ts"

export const env = apiSchema.parse(Deno.env.toObject());