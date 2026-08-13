import { z } from "zod";

/**
 * The initial payload added to the ingestion queue
 */
export const initialIngestionPayloadSchema = z.object({
  filePath: z.string()
})

/**
 * The Initial payload after validating the file belongs to a library
 * i.e. the comic file is located in a library registered in the database
 */
export const comicFileWithValidatedLibrarySchema = initialIngestionPayloadSchema.extend({
  libraryId: z.int()
})

export const comicFileRecordedForSeriesProcessingSchema = initialIngestionPayloadSchema.extend({
  comicBookId: z.int(),
  metadataFileExists: z.boolean().optional()
})