import { z } from "zod"
import { initialIngestionPayloadSchema } from "kitsune-komix-schemas"

export type IngestionPayload = z.infer<typeof initialIngestionPayloadSchema>