import { workerSchema } from "@schemas/config/worker.schema.ts"

export const env = workerSchema.parse(process.env)