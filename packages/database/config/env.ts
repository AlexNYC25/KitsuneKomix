import { dbSchema } from "@schemas/db.schema.ts"

export const env = dbSchema.parse(process.env);