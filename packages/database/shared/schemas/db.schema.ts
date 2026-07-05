import { z } from "zod";

export const dbSchema = z.object({
  CONFIG_DIRECTORY: z.string().default("/app/data/config"),

  HONKER_LIB_PATH: z.string().default("/honker/libhonker_ext.so"),

  LOG_LEVEL: z.string().default("info")
})