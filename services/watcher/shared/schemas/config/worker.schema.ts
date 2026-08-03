import { z } from "zod"

export const workerSchema = z.object({
  MODE: z.enum(['development', 'production', 'test']).default('development'),

  COMICS_DIRECTORY: z.string().default("/app/data/comics"),
  CONFIG_DIRECTORY: z.string().default("/app/data/config")
})