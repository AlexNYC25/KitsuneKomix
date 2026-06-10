import { queueLogger } from "#logger/loggers.ts";

import { ComicBookIngestionModel } from "#infrastructure/db/sqlite/models/comicBookIngestion.model.ts";

import { standardizeMetadata } from "#utilities/metadata.ts";
import { getComicFileRawDetails } from "#utilities/comic-parser.ts";

import type { StandardizedComicMetadata, JobHandler, JobHandlerResult, ComicBookIngestionRecord} from "#types/index.ts";


/**
 * Handles the METADATA_EXTRACTION stage of comic ingestion.
 * 
 * Responsibilities:
 * - Extract metadata from the comic file (ComicInfo.xml, CoMet.xml)
 * - Parse filename for additional metadata
 * - Store extracted metadata in the ingestion record
 * - Move to METADATA_CANDIDATES_CREATED state
 */
export class MetadataExtractionHandler implements JobHandler {
  async handle(record: ComicBookIngestionRecord): Promise<JobHandlerResult> {
    try {
      const metadata = ComicBookIngestionModel.getMetadata(record);
      const filePath = metadata?.filePath as string | undefined;
      const comicBookId = metadata?.comicBookId as number | undefined;

      if (!filePath || !comicBookId) {
        return {
          success: false,
          errorMessage: "Missing file path or comic book ID in metadata",
        };
      }

      queueLogger.info(
        `[MetadataExtractionHandler] Extracting metadata for: ${filePath}`
      );

      // Extract standardized metadata from comic file
      const standardizedMetadata: StandardizedComicMetadata | undefined =
        await standardizeMetadata(filePath);

      // Parse filename for additional details
      const fileNameMetadata = getComicFileRawDetails(filePath);

      // Combine metadata sources
      const extractedMetadata = {
        standardized: standardizedMetadata || null,
        fileName: fileNameMetadata,
        extractedAt: new Date().toISOString(),
      };

      if (standardizedMetadata) {
        queueLogger.info(
          `[MetadataExtractionHandler] Successfully extracted metadata from file`
        );
      } else {
        queueLogger.warn(
          `[MetadataExtractionHandler] No embedded metadata found, using filename only`
        );
      }

      // Update ingestion record with extracted metadata
      await ComicBookIngestionModel.updateState(
        record.id,
        "METADATA_CANDIDATES_CREATED",
        {
          ...metadata,
          extractedMetadata,
        }
      );

      return {
        success: true,
        data: {
          hasEmbeddedMetadata: !!standardizedMetadata,
          extractedMetadata,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      queueLogger.error(`[MetadataExtractionHandler] Error: ${errorMessage}`);

      return {
        success: false,
        errorMessage,
      };
    }
  }
}
