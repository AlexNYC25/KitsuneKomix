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
        switch (candidate.type) {
          case "genre":
            // 
            break;
          case "publisher":
            // 
            break;
          case "imprint":
            // 
            break;
          case "writer":
            // 
            break;
          case "penciler":
            // 
            break;
          case "inker":
            // 
            break;
          case "colorist":
            //
            break;
          case "letterer":
            //
            break;
          case "cover_artist":
            //
            break;
          case "editor":
            //
            break;
          case "character":
            //
            break;
          case "team":
            //
            break;
          case "location":
            //
            break;
          case "story_arc":
            //
            break;
          case "series_group":
            //
            break;
          case "series":
            continue;
          default:
            queueLogger.warn(
              `[ComicMetadataAggregatedHandler] Unrecognized candidate type: ${candidate.type} for candidate ID ${candidate.id}`,
            );
        }
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

const aggregateGenreMetadata = async (candidate: ComicMetadataCandidate): Promise<void> => {
}

const aggregatePublisherMetadata = async (candidate: ComicMetadataCandidate): Promise<void> => {
}

const aggregateImprintMetadata = async (candidate: ComicMetadataCandidate): Promise<void> => {
}

const aggregateWriterMetadata = async (candidate: ComicMetadataCandidate): Promise<void> => {
}

const aggregatePencilerMetadata = async (candidate: ComicMetadataCandidate): Promise<void> => {
}

const aggregateInkerMetadata = async (candidate: ComicMetadataCandidate): Promise<void> => {
}

const aggregateColoristMetadata = async (candidate: ComicMetadataCandidate): Promise<void> => {
}

const aggregateLettererMetadata = async (candidate: ComicMetadataCandidate): Promise<void> => {
}

const aggregateCoverArtistMetadata = async (candidate: ComicMetadataCandidate): Promise<void> => {
}

const aggregateEditorMetadata = async (candidate: ComicMetadataCandidate): Promise<void> => {
}

const aggregateCharacterMetadata = async (candidate: ComicMetadataCandidate): Promise<void> => {
}

const aggregateTeamMetadata = async (candidate: ComicMetadataCandidate): Promise<void> => {
}

const aggregateLocationMetadata = async (candidate: ComicMetadataCandidate): Promise<void> => {
}

const aggregateStoryArcMetadata = async (candidate: ComicMetadataCandidate): Promise<void> => {
}

const aggregateSeriesGroupMetadata = async (candidate: ComicMetadataCandidate): Promise<void> => {
}