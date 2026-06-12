import { queueLogger } from "#logger/loggers.ts";

import { updateIngestionRecordState } from "#infrastructure/db/sqlite/models/comicBookIngestion.model.ts";
import { updateComicBook } from "#infrastructure/db/sqlite/models/comicBooks.model.ts";

import { standardizeMetadata, combineMetadataWithParsedFileDetails } from "#utilities/metadata.ts";
import { getComicFileRawDetails } from "#utilities/comic-parser.ts";
import { fileExists } from "#utilities/file.ts";

import type { StandardizedComicMetadata, JobHandler, JobHandlerResult, ComicBookIngestion, ComicFileDetails, NewComicBook} from "#types/index.ts";


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
  async handle(record: ComicBookIngestion): Promise<JobHandlerResult> {
    try {
      const fileExistsResult: boolean = await fileExists(record.filePath);

      if (!fileExistsResult) {
        return {
          success: false,
          errorMessage: `File not found at path: ${record.filePath}`,
        };
      }

      // Parse filename for additional details
      const fileNameMetadata: ComicFileDetails = getComicFileRawDetails(record.filePath);

      // Extract standardized metadata from comic file
      const standardizedMetadata: StandardizedComicMetadata | undefined =
        await standardizeMetadata(record.filePath);

      if (standardizedMetadata) {
        queueLogger.info(
          `[MetadataExtractionHandler] Successfully extracted embedded metadata for file: ${record.filePath}`
        );

        const newStateRecord: Partial<ComicBookIngestion> = {
          state: "METADATA_CANDIDATES_CREATED",
          metadata: JSON.stringify(standardizedMetadata),
        };
        const _ingestionRecord: ComicBookIngestion = await updateIngestionRecordState(record.id, newStateRecord)

      } else {
        queueLogger.warn(
          `[MetadataExtractionHandler] No embedded metadata found for file: ${record.filePath}`
        );

        const newStateRecord: Partial<ComicBookIngestion> = {
          state: "COMIC_INGESTION_COMPLETED",
        };

        const _ingestionRecord: ComicBookIngestion = await updateIngestionRecordState(
          record.id,
          newStateRecord
        );
      }

    
      const comicRecord: Partial<NewComicBook> = combineMetadataWithParsedFileDetails(fileNameMetadata, standardizedMetadata);
      
      const updatedComicBookRecord: boolean = await updateComicBook(record.comicBookId, comicRecord);


      if (!updatedComicBookRecord) {
        queueLogger.error(
          `[MetadataExtractionHandler] Failed to update comic book record with extracted metadata for comicBookId: ${record.comicBookId}`
        );

        return {
          success: false,
          errorMessage: `Failed to update comic book record with extracted metadata for comicBookId: ${record.comicBookId}`,
        };
      }

      queueLogger.info(
        `[MetadataExtractionHandler] Updated comic book record with extracted metadata for comicBookId: ${record.comicBookId}`
      );

      return {
        success: true,
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
