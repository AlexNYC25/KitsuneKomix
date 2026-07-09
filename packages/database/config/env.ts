import { z } from "zod";

// NOTE: declared this schema locally as there is a compatibility issue between folder aliasas and drizzle-kit
const dbSchema = z.object({
  CONFIG_DIRECTORY: z.string().default("/app/data/config"),
  HONKER_LIB_PATH: z.string().default("/honker/libhonker_ext.so"),
  LOG_LEVEL: z.string().default("info"),
  PAGE_SIZE: z.number().default(20),
  DB_FILE_NAME: z.string().default("database.sqlite"),
});

export const env = dbSchema.parse(process.env);