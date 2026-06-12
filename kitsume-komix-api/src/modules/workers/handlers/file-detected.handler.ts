import { queueLogger } from "#logger/loggers.ts";

import { updateIngestionRecordState } from "#infrastructure/db/sqlite/models/comicBookIngestion.model.ts";
import { getLibraryContainingPath } from "#infrastructure/db/sqlite/models/comicLibraries.model.ts";
import { getComicBookByFilePath, insertComicBookReturningComicBook } from "#infrastructure/db/sqlite/models/comicBooks.model.ts";

import { calculateFileHash } from "#utilities/hash.ts";
import { getFileNameFromPath, getFileSize, fileExists } from "#utilities/file.ts";

import type { NewComicBook, JobHandler, JobHandlerResult, ComicBookIngestion, ComicLibrary, ComicBook } from "#types/index.ts";

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
      // Check if file exists and is accessible
      const fileExistsResult: boolean = await fileExists(record.filePath);

      if (!fileExistsResult) {
        return {
          success: false,
          errorMessage: `File not found at path: ${record.filePath}`,
        };
      }

      // We want to double check the comic at the file path belongs to a valid library (i.e. enabled) before doing any processing
      const validLibrary: ComicLibrary | null = await getLibraryContainingPath(record.filePath);

      if (!validLibrary) {
        return {
          success: false,
          errorMessage: `No library found for file path: ${record.filePath}`,
        };
      }

      // Compile initial info from the file (hash, name, size) 
      const { fileHash, fileName, fileSize } = await compileInitialInfoFromFile(record.filePath);

      const currentComicRecord: ComicBook | null = await getComicBookByFilePath(record.filePath);

      // If no existing comic record is found, then we insert a new record into the comic books table to start with
      // And the enqueue the next state to populate the metadata
      if (!currentComicRecord) {
        queueLogger.info(
          `[FileDetectedHandler] No existing comic record found for file, will create new: ${record.filePath}`
        );

        return processCompletelyNewComic(validLibrary, record, fileName, fileHash, fileSize);
      }

      // If the file hash matches the existing record, we can skip processing and move directly to completed state
      if (currentComicRecord && currentComicRecord.hash === fileHash) {
        queueLogger.info(
          `[FileDetectedHandler] The comic record already exists for file, and has not changed: ${record.filePath}`
        );

        return processExistingComicWithUnchangedHash(record, currentComicRecord, fileHash);
      }

      // If the file hash has changed then we need to reprocess the comic - (i.e. check if the metadata has changes and update the comic record accordingly)
      if (currentComicRecord && currentComicRecord.hash !== fileHash) {
        queueLogger.info(
          `[FileDetectedHandler] Comic already exists but hash changed, will reprocess: ${record.filePath}`
        );

        return processExistingComicWithChangedHash(record, currentComicRecord, fileHash);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      queueLogger.error(`[FileDetectedHandler] Error: ${errorMessage}`);
      
      return {
        success: false,
        errorMessage,
      };
    } 

    // Fallback return to satisfy return type, we should never actually reach this point because all cases should be handled above, but we need it to satisfy the return type of the function
    return {
      success: false,
      errorMessage: "Unhandled case in FileDetectedHandler, this should not happen",
    };
    
  }
}

/**
 * Wrapper function to compile initial comic book info from the file, such as hash, name and size
 * @param filePath The file path of the comic book to process
 * @returns An object containing the file hash, name and size
 */
const compileInitialInfoFromFile = async (filePath: string): Promise<{
  fileHash: string;
  fileName: string;
  fileSize: number;
}> => {
  const fileHash: string = await calculateFileHash(filePath);
  const fileName: string = getFileNameFromPath(filePath);
  const fileSize: number = await getFileSize(filePath);

  return {
    fileHash,
    fileName,
    fileSize,
  };
}

/**
 * The actions to take when we have a completely new comic book that doesn't exist in the database at all - we want to create a new record for it and move it to the next state for metadata extraction
 * @param validLibrary The library that the comic belongs to, which we have already verified exists and is valid before calling this function
 * @param record The ingestion record that triggered the file detected event, containing the file path and other relevant info
 * @param fileName The name of the file, extracted from the file path, to be used as a temporary title for the comic book record until we can extract metadata
 * @param fileHash The hash of the file, calculated to uniquely identify the comic book and detect changes in the future
 * @param fileSize The size of the file, which can be useful for validating the file and for informational purposes in the comic book record
 * @returns 
 */
const processCompletelyNewComic = async (
  validLibrary: ComicLibrary, 
  record: ComicBookIngestion, 
  fileName: string, 
  fileHash: string, 
  fileSize: number
): Promise<JobHandlerResult> => {
  try {
    const newComicBook: NewComicBook = {
      libraryId: validLibrary.id,
      filePath: record.filePath,
      hash: fileHash,
      title: fileName, // Temporary - will be updated with metadata
      fileSize,
    };

    const insertedComic: ComicBook = await insertComicBookReturningComicBook(newComicBook);

    const newStateRecord: Partial<ComicBookIngestion> = {
      state: "METADATA_EXTRACTION",
    };

    const _ingestionRecord: ComicBookIngestion = await updateIngestionRecordState(
      record.id,
      newStateRecord
    );

    return {
      success: true,
      data: { comicBookId: insertedComic.id, filePath: record.filePath, fileHash },
    };
  } catch (error) {
    const errorMessage: string = error instanceof Error ? error.message : String(error);
    queueLogger.error(`[FileDetectedHandler] Error processing new comic: ${errorMessage}`);
    
    throw error;
  }
}

/**
 * The actions to take when we have an existing comic book with the same file hash - in this case we can safely assume that the comic has already been ingested and processed, so we can skip to the completed state without doing any further processing
 * @param record The ingestion record that triggered the file detected event, containing the file path and other relevant info
 * @param currentComicRecord The existing comic book record from the database that matches the file path, which we have already verified has the same file hash before calling this function
 * @param fileHash The hash of the file, calculated to uniquely identify the comic book and detect changes in the future
 * @returns 
 */
const processExistingComicWithUnchangedHash = async (
  record: ComicBookIngestion, 
  currentComicRecord: ComicBook, 
  fileHash: string
): Promise<JobHandlerResult> => {
  try {
    const newStateRecord: Partial<ComicBookIngestion> = {
      state: "COMIC_INGESTION_COMPLETED",
    };

    const _ingestionRecord: ComicBookIngestion = await updateIngestionRecordState(
      record.id,
      newStateRecord
    );

    return {
      success: true,
      data: { comicBookId: currentComicRecord.id, filePath: record.filePath, fileHash, alreadyCompleted: true },
    };
  } catch (error) {
    const errorMessage: string = error instanceof Error ? error.message : String(error);
    queueLogger.error(`[FileDetectedHandler] Error processing existing comic with unchanged hash: ${errorMessage}`);
    
    throw error;
  }
}

/**
 * The actions to take when we have an existing comic book with a different file hash - in this case we want to reprocess the comic book as if it were new, to check if the metadata has changed and update the comic record accordingly. This is important to handle cases where the file has been modified or replaced, and we want to ensure our database stays up to date with the actual files on disk.
 * @param record The ingestion record that triggered the file detected event, containing the file path and other relevant info
 * @param currentComicRecord The existing comic book record from the database that matches the file path, which we have already verified has a different file hash before calling this function
 * @param fileHash The hash of the file, calculated to uniquely identify the comic book and detect changes in the future
 * @returns 
 */
const processExistingComicWithChangedHash = async (
  record: ComicBookIngestion, 
  currentComicRecord: ComicBook, 
  fileHash: string
): Promise<JobHandlerResult> => {
  try {
    const newStateRecord: Partial<ComicBookIngestion> = {
      state: "METADATA_EXTRACTION",
    };

    const _ingestionRecord: ComicBookIngestion = await updateIngestionRecordState(
      record.id,
      newStateRecord
    );

    return {
      success: false,
      data: { comicBookId: currentComicRecord.id, filePath: record.filePath, fileHash },
    };
  } catch (error) {
    const errorMessage: string = error instanceof Error ? error.message : String(error);
    queueLogger.error(`[FileDetectedHandler] Error processing existing comic with changed hash: ${errorMessage}`);
    
    throw error;
  }
}