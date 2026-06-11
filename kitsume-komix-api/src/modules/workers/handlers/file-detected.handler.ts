import { queueLogger } from "#logger/loggers.ts";

import { updateIngestionRecordState } from "#infrastructure/db/sqlite/models/comicBookIngestion.model.ts";
import { getLibraryContainingPath } from "#infrastructure/db/sqlite/models/comicLibraries.model.ts";
import { getComicBookByFilePath, insertComicBookReturningComicBook } from "#infrastructure/db/sqlite/models/comicBooks.model.ts";

import { calculateFileHash } from "#utilities/hash.ts";
import { getFileNameFromPath, getFileSize } from "#utilities/file.ts";

import type { NewComicBook, JobHandler, JobHandlerResult, ComicBookIngestion } from "#types/index.ts";

/**
 * Handles the FILE_DETECTED stage of comic ingestion.
 * 
 * Responsibilities:
 * - Verify the file exists and is accessible
 * - Calculate file hash
 * - Check if comic book already exists in database
 * - Create or update the comic book record with basic file information
 * - Move to METADATA_EXTRACTION state
 */
export class FileDetectedHandler implements JobHandler {
  async handle(record: ComicBookIngestion): Promise<JobHandlerResult> {
    try {
      // We want to double check the comic at the file path belongs to a valid library (i.e. enabled) before doing any processing
      const validLibrary = await getLibraryContainingPath(record.filePath);

      if (!validLibrary) {
        return {
          success: false,
          errorMessage: `No library found for file path: ${record.filePath}`,
        };
      }

      const fileHash = await calculateFileHash(record.filePath);
      const fileName = getFileNameFromPath(record.filePath);
      const fileSize = await getFileSize(record.filePath);

      const currentComicRecord = await getComicBookByFilePath(record.filePath);

      // If no existing comic record is found, then we insert a new record into the comic books table to start with
      // And the enqueue the next state to populate the metadata
      if (!currentComicRecord) {
        queueLogger.info(
          `[FileDetectedHandler] No existing comic record found for file, will create new: ${record.filePath}`
        );

        const newComicBook: NewComicBook = {
          libraryId: validLibrary.id,
          filePath: record.filePath,
          hash: fileHash,
          title: fileName, // Temporary - will be updated with metadata
          series: "Unknown Series", // Temporary
          issueNumber: "1", // Temporary
          fileSize,
        };

        const insertedComic = await insertComicBookReturningComicBook(newComicBook);

        const newStateRecord: Partial<ComicBookIngestion> = {
          state: "METADATA_EXTRACTION",
        };

        await updateIngestionRecordState(
          record.id,
          newStateRecord
        );

        return {
          success: true,
          data: { comicBookId: insertedComic.id, filePath: record.filePath, fileHash },
        };
      }

      // If the file hash matches the existing record, we can skip processing and move directly to completed state
      if (currentComicRecord && currentComicRecord.hash === fileHash) {
        const newStateRecord: Partial<ComicBookIngestion> = {
          state: "COMIC_INGESTION_COMPLETED",
        };

        await updateIngestionRecordState(
          record.id,
          newStateRecord
        );

        return {
          success: true,
          data: { comicBookId: currentComicRecord.id, filePath: record.filePath, fileHash, alreadyCompleted: true },
        };
      }

      // If the file hash has changed then we need to reprocess the comic - (i.e. check if the metadata has changes and update the comic record accordingly)
      if (currentComicRecord && currentComicRecord.hash !== fileHash) {
        queueLogger.info(
          `[FileDetectedHandler] Comic already exists but hash changed, will reprocess: ${record.filePath}`
        );

        const newStateRecord: Partial<ComicBookIngestion> = {
          state: "METADATA_EXTRACTION",
        };

        await updateIngestionRecordState(
          record.id,
          newStateRecord
        );

        return {
          success: true,
          data: { comicBookId: currentComicRecord.id, filePath: record.filePath, fileHash },
        };
      }

      return {
        success: false,
        data: { comicBookId: currentComicRecord.id, filePath: record.filePath, fileHash },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      queueLogger.error(`[FileDetectedHandler] Error: ${errorMessage}`);
      
      return {
        success: false,
        errorMessage,
      };
    }
  }
}
