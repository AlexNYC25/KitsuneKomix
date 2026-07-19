import { z } from "zod"
import { 
  initialIngestionPayloadSchema,
  comicFileWithValidatedLibrarySchema
} from "kitsune-komix-schemas"

export type IngestionPayload = z.infer<typeof initialIngestionPayloadSchema>

export type IngestionToComicBookRecordPayload = z.infer<typeof comicFileWithValidatedLibrarySchema>