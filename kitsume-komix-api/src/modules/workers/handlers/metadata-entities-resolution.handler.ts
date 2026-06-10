import { queueLogger } from "#logger/loggers.ts";

import { ComicBookIngestionModel } from "#infrastructure/db/sqlite/models/comicBookIngestion.model.ts";
import { ComicMetadataCandidatesModel } from "#infrastructure/db/sqlite/models/comicMetadataCandidates.model.ts";

import type { JobHandler, JobHandlerResult, ComicBookIngestionRecord} from "#types/index.ts";


/**
 * Handles the METADATA_ENTITIES_RESOLVED stage of comic ingestion.
 * 
 * Responsibilities:
 * - Process pending metadata candidates
 * - For each candidate, find or create the corresponding entity
 * - Update candidates with resolved entity IDs
 * - Mark candidates as "accepted" when resolved
 * - Move to COMIC_LINKS_BUILT state
 * 
 * NOTE: This is a placeholder implementation. Full resolution logic
 * will be added incrementally based on entity type.
 */
export class MetadataEntitiesResolutionHandler implements JobHandler {
  async handle(record: ComicBookIngestionRecord): Promise<JobHandlerResult> {
    try {
      const metadata = ComicBookIngestionModel.getMetadata(record);
      const comicBookId = metadata?.comicBookId as number | undefined;

      if (!comicBookId) {
        return {
          success: false,
          errorMessage: "Missing comic book ID in metadata",
        };
      }

      queueLogger.info(
        `[MetadataEntitiesResolutionHandler] Resolving entities for comic ID: ${comicBookId}`
      );

      // Get all pending candidates
      const candidates = await ComicMetadataCandidatesModel.getPendingByComicBookId(
        comicBookId
      );

      if (candidates.length === 0) {
        queueLogger.info(
          `[MetadataEntitiesResolutionHandler] No pending candidates to resolve`
        );
      }

      let resolvedCount = 0;

      // TODO: Implement entity resolution logic for each candidate type
      // For now, we'll just mark candidates as processed without creating entities
      // This will be filled in incrementally as entity creation logic is needed
      
      for (const candidate of candidates) {
        // Placeholder: Mark as accepted without resolving
        // Real implementation will:
        // 1. Check if entity exists (by normalized value)
        // 2. If exists, get its ID
        // 3. If not, create new entity
        // 4. Update candidate with resolved ID
        
        await ComicMetadataCandidatesModel.updateStatus(
          candidate.id,
          "accepted",
          undefined // Will be the actual entity ID when implemented
        );
        
        resolvedCount++;
      }

      queueLogger.info(
        `[MetadataEntitiesResolutionHandler] Resolved ${resolvedCount} candidates`
      );

      // Update ingestion record to next state
      await ComicBookIngestionModel.updateState(
        record.id,
        "COMIC_LINKS_BUILT",
        {
          ...metadata,
          entitiesResolved: resolvedCount,
        }
      );

      return {
        success: true,
        data: {
          candidatesProcessed: candidates.length,
          entitiesResolved: resolvedCount,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      queueLogger.error(
        `[MetadataEntitiesResolutionHandler] Error: ${errorMessage}`
      );

      return {
        success: false,
        errorMessage,
      };
    }
  }
}
