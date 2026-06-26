import { z } from "zod";

export const dbSchema = z.object({
  CONFIG_DIRECTORY: z.string().default("/app/data/config"),

  LOG_LEVEL: z.string().default("info")
})