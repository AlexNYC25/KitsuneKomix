import { queueLogger } from "#logger/loggers.ts";

import { updateIngestionRecordState } from "#infrastructure/db/sqlite/models/comicBookIngestion.model.ts";
import { insertComicMetadataCandidates } from "#infrastructure/db/sqlite/models/comicMetadataCandidates.model.ts";

import { convertStandardizedMetadataToCandidates } from "#utilities/metadata.ts";

import type { StandardizedComicMetadata, JobHandler, JobHandlerResult, ComicBookIngestion, ComicMetadataCandidate, NewComicMetadataCandidate} from "#types/index.ts";

/**
 * Handles the METADATA_CANDIDATES_CREATED stage of comic ingestion.
 * 
 * Responsibilities:
 * - Extract individual metadata values from the standardized metadata
 * - Create candidate records for each metadata value
 * - Candidates will later be resolved to actual entities (or create new ones)
 * - Move to METADATA_ENTITIES_RESOLVED state
 */
export class MetadataCandidatesCreationHandler implements JobHandler {
  async handle(record: ComicBookIngestion): Promise<JobHandlerResult> {
    try {
      const metadataObject: StandardizedComicMetadata | undefined = record.metadata ? JSON.parse(record.metadata) : undefined;

      if (!metadataObject) {
        return {
          success: false,
          errorMessage: "No metadata found in record",
        };
      }

      const candidatesForInsertions: NewComicMetadataCandidate[] = convertStandardizedMetadataToCandidates(metadataObject, record.id);

      const insertedCandidates: ComicMetadataCandidate[] = await insertComicMetadataCandidates(candidatesForInsertions);

      queueLogger.info(
        `[MetadataCandidatesCreationHandler] Inserted ${insertedCandidates.length} metadata candidates for record ID: ${record.id}`
      );

      // Update ingestion record to next state
      const newStateRecord: Partial<ComicBookIngestion> = {
        state: "METADATA_ENTITIES_RESOLVED",
      };

      const _ingestionRecord: ComicBookIngestion = await updateIngestionRecordState(
        record.id,
        newStateRecord
      );

      return {
        success: true,
        data: {
          candidatesCreated: insertedCandidates.length,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      queueLogger.error(
        `[MetadataCandidatesCreationHandler] Error: ${errorMessage}`
      );

      return {
        success: false,
        errorMessage,
      };
    }
  }
}
