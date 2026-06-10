import { queueLogger } from "#logger/loggers.ts";
import { ComicBookIngestionModel } from "#infrastructure/db/sqlite/models/comicBookIngestion.model.ts";
import { 
  ComicMetadataCandidatesModel,
  type MetadataCandidateType 
} from "#infrastructure/db/sqlite/models/comicMetadataCandidates.model.ts";

import type { StandardizedComicMetadata, JobHandler, JobHandlerResult, ComicBookIngestionRecord} from "#types/index.ts";

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
  async handle(record: ComicBookIngestionRecord): Promise<JobHandlerResult> {
    try {
      const metadata = ComicBookIngestionModel.getMetadata(record);
      const comicBookId = metadata?.comicBookId as number | undefined;
      const extractedMetadata = metadata?.extractedMetadata as {
        standardized: StandardizedComicMetadata | null;
        fileName: Record<string, unknown>;
      } | undefined;

      if (!comicBookId) {
        return {
          success: false,
          errorMessage: "Missing comic book ID in metadata",
        };
      }

      queueLogger.info(
        `[MetadataCandidatesCreationHandler] Creating candidates for comic ID: ${comicBookId}`
      );

      const standardized = extractedMetadata?.standardized;
      const fileName = extractedMetadata?.fileName;

      // Collect all metadata values into candidates
      const candidates: Array<{
        comicBookId: number;
        type: MetadataCandidateType;
        value: string;
      }> = [];

      // Helper to add candidates
      const addCandidates = (
        type: MetadataCandidateType,
        values: string[] | string | undefined
      ) => {
        if (!values) return;
        const valueArray = Array.isArray(values) ? values : [values];
        
        for (const value of valueArray) {
          if (value && value.trim()) {
            candidates.push({
              comicBookId,
              type,
              value: value.trim(),
            });
          }
        }
      };

      // Extract candidates from standardized metadata
      if (standardized) {
        addCandidates("title", standardized.title);
        addCandidates("series", standardized.series);
        addCandidates("publisher", standardized.publisher);
        addCandidates("writer", standardized.writers);
        addCandidates("artist", standardized.pencilers); // Map pencilers to artists
        addCandidates("penciler", standardized.pencilers);
        addCandidates("inker", standardized.inkers);
        addCandidates("colorist", standardized.colorists);
        addCandidates("letterer", standardized.letterers);
        addCandidates("cover_artist", standardized.coverArtists);
        addCandidates("editor", standardized.editors);
        addCandidates("character", standardized.characters);
        addCandidates("team", standardized.teams);
        addCandidates("location", standardized.locations);
        addCandidates("story_arc", standardized.storyArcs);
      }

      // Extract candidates from filename parsing
      if (fileName) {
        const fileNameSeries = fileName.series as string | undefined;
        const fileNameTitle = fileName.title as string | undefined;
        
        if (fileNameSeries && fileNameSeries !== "Unknown Series") {
          addCandidates("series", fileNameSeries);
        }
        
        if (fileNameTitle) {
          addCandidates("title", fileNameTitle);
        }
      }

      // Bulk create candidates
      if (candidates.length > 0) {
        await ComicMetadataCandidatesModel.createMany(candidates);
        queueLogger.info(
          `[MetadataCandidatesCreationHandler] Created ${candidates.length} candidates`
        );
      } else {
        queueLogger.warn(
          `[MetadataCandidatesCreationHandler] No metadata candidates to create`
        );
      }

      // Update ingestion record to next state
      await ComicBookIngestionModel.updateState(
        record.id,
        "METADATA_ENTITIES_RESOLVED",
        {
          ...metadata,
          candidatesCount: candidates.length,
        }
      );

      return {
        success: true,
        data: {
          candidatesCreated: candidates.length,
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
