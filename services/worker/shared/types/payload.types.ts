import { z } from "zod"
import { 
  type MetadataCompiled 
} from "comic-metadata-tool"
import { 
  initialIngestionPayloadSchema,
  comicFileWithValidatedLibrarySchema,
  comicFileRecordedForSeriesProcessingSchema,
  comicFileInsertedSecondaryPipelineSchema,
} from "kitsune-komix-schemas"

export type IngestionPayload = z.infer<typeof initialIngestionPayloadSchema>

export type IngestionToComicBookRecordPayload = z.infer<typeof comicFileWithValidatedLibrarySchema>

export type IngestionToComicSeriesMappingPayload = z.infer<typeof comicFileRecordedForSeriesProcessingSchema>

export type IngestionToSecondaryPipelinePayload = z.infer<typeof comicFileInsertedSecondaryPipelineSchema>

export type MetadataExtractionPayload = IngestionToSecondaryPipelinePayload & {
  metadata: MetadataCompiled
}