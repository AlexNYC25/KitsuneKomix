import { z } from "zod"
import { 
  initialIngestionPayloadSchema,
  comicFileWithValidatedLibrarySchema,
  comicFileRecordedForSeriesProcessingSchema
} from "kitsune-komix-schemas"

export type IngestionPayload = z.infer<typeof initialIngestionPayloadSchema>

export type IngestionToComicBookRecordPayload = z.infer<typeof comicFileWithValidatedLibrarySchema>

export type IngestionToComicSeriesMappingPayload = z.infer<typeof comicFileRecordedForSeriesProcessingSchema>