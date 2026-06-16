import { queueLogger } from "#logger/loggers.ts";

import { getComicMetadataCandidatesByComicBookId } from "#infrastructure/db/sqlite/models/comicMetadataCandidates.model.ts";
import { updateIngestionRecordState } from "#infrastructure/db/sqlite/models/comicBookIngestion.model.ts";

import type { JobHandler, JobHandlerResult, ComicBookIngestion, ComicMetadataCandidate } from "#types/index.ts";

export class ComicMetadataAggregatedHandler implements JobHandler {
  async handle(record: ComicBookIngestion): Promise<JobHandlerResult> {
    try {
      if (!record.id) {
        return {
          success: false,
          errorMessage: "Missing comic book ID in metadata",
        };
      }

      const metadataCandidatesToProcess: ComicMetadataCandidate[] =
          await getComicMetadataCandidatesByComicBookId(record.id, "accepted");

      if (metadataCandidatesToProcess.length === 0) {
        queueLogger.info(
          `[MetadataEntitiesResolutionHandler] No pending candidates to resolve`,
        );
      }

      for (const candidate of metadataCandidatesToProcess) {

      }

      const newStateRecord: Partial<ComicBookIngestion> = {
        state: "COMIC_INGESTION_COMPLETED",
      };

      const _ingestionRecord: ComicBookIngestion =
        await updateIngestionRecordState(
          record.id,
          newStateRecord,
        );



      return {
        success: true,
        data: {
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      queueLogger.error(
        `[ComicMetadataAggregatedHandler] Error: ${errorMessage}`
      );

      return {
        success: false,
        errorMessage,
      };
    }
  }
}