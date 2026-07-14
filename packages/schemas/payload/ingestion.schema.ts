import { z } from "zod";

/**
 * The initial payload added to the ingestion queue
 */
export const initialIngestionPayloadSchema = z.object({
  filePath: z.string()
})