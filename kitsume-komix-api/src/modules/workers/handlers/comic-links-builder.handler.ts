import { queueLogger } from "#logger/loggers.ts";

import { ComicBookIngestionModel } from "#infrastructure/db/sqlite/models/comicBookIngestion.model.ts";
import { ComicMetadataCandidatesModel } from "#infrastructure/db/sqlite/models/comicMetadataCandidates.model.ts";

import type { JobHandler, JobHandlerResult, ComicBookIngestionRecord} from "#types/index.ts";


/**
 * Handles the COMIC_LINKS_BUILT stage of comic ingestion.
 * 
 * Responsibilities:
 * - Link the comic book to resolved entities (writers, artists, series, etc.)
 * - Update the comic book record with final metadata
 * - Create relationship records in junction tables
 * - Move to COMIC_INGESTION_COMPLETED state
 * 
 * NOTE: This is a placeholder implementation. Full linking logic
 * will be added incrementally as entity types are implemented.
 */
export class ComicLinksBuilderHandler implements JobHandler {
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
        `[ComicLinksBuilderHandler] Building links for comic ID: ${comicBookId}`
      );

      // Get all accepted candidates with resolved entity IDs
      const candidates = await ComicMetadataCandidatesModel.getByComicBookId(
        comicBookId
      );

      const acceptedCandidates = candidates.filter(
        (c) => c.status === "accepted" && c.resolvedId
      );

      queueLogger.info(
        `[ComicLinksBuilderHandler] Found ${acceptedCandidates.length} resolved candidates to link`
      );

      // TODO: Implement linking logic for each entity type
      // For now, this is a placeholder
      // Real implementation will:
      // 1. Group candidates by type
      // 2. For each type, create the appropriate link records
      // 3. Update the comic book record with primary metadata (title, series, etc.)

      let linksCreated = 0;

      // Placeholder: Count what we would link
      for (const candidate of acceptedCandidates) {
        // Will create actual links here
        linksCreated++;
      }

      queueLogger.info(
        `[ComicLinksBuilderHandler] Created ${linksCreated} links`
      );

      // Update the comic book with final metadata
      const extractedMetadata = metadata?.extractedMetadata as {
        standardized: { title?: string; series?: string; issueNumber?: string } | null;
      } | undefined;

      if (extractedMetadata?.standardized) {
        const { db } = await import("#infrastructure/db/sqlite/client.ts").then(m => ({
          db: m.getClient().db
        }));
        
        if (db) {
          const { comicBooksTable } = await import("#infrastructure/db/sqlite/schemas/index.ts");
          const { eq } = await import("drizzle-orm");
          
          const updateData: Record<string, unknown> = {};
          
          if (extractedMetadata.standardized.title) {
            updateData.title = extractedMetadata.standardized.title;
          }
          
          if (extractedMetadata.standardized.series) {
            updateData.series = extractedMetadata.standardized.series;
          }
          
          if (extractedMetadata.standardized.issueNumber) {
            updateData.issueNumber = extractedMetadata.standardized.issueNumber;
          }

          if (Object.keys(updateData).length > 0) {
            await db
              .update(comicBooksTable)
              .set(updateData)
              .where(eq(comicBooksTable.id, comicBookId));
            
            queueLogger.info(
              `[ComicLinksBuilderHandler] Updated comic book with extracted metadata`
            );
          }
        }
      }

      // Update ingestion record to completed state
      await ComicBookIngestionModel.updateState(
        record.id,
        "COMIC_INGESTION_COMPLETED",
        {
          ...metadata,
          linksCreated,
          completedAt: new Date().toISOString(),
        }
      );

      return {
        success: true,
        data: {
          linksCreated,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      queueLogger.error(`[ComicLinksBuilderHandler] Error: ${errorMessage}`);

      return {
        success: false,
        errorMessage,
      };
    }
  }
}
