import { queueLogger } from "#logger/loggers.ts";

import { ComicBookIngestionModel } from "#infrastructure/db/sqlite/models/comicBookIngestion.model.ts";
import { getLibraryContainingPath } from "#infrastructure/db/sqlite/models/comicLibraries.model.ts";

import { calculateFileHash } from "#utilities/hash.ts";
import { getFileNameFromPath, getFileSize } from "#utilities/file.ts";

import type { NewComicBook, JobHandler, JobHandlerResult, ComicBookIngestionRecord } from "#types/index.ts";

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
  async handle(record: ComicBookIngestionRecord): Promise<JobHandlerResult> {
    try {
      // Get metadata from ingestion record
      const metadata = ComicBookIngestionModel.getMetadata(record);
      const filePath = metadata?.filePath as string | undefined;

      if (!filePath) {
        return {
          success: false,
          errorMessage: "No file path found in ingestion metadata",
        };
      }

      queueLogger.info(`[FileDetectedHandler] Processing file: ${filePath}`);

      // Calculate file hash
      const fileHash = await calculateFileHash(filePath);
      const fileName = getFileNameFromPath(filePath);
      const fileSize = await getFileSize(filePath);

      // Find the library that contains this file
      const library = await getLibraryContainingPath(filePath);
      if (!library) {
        return {
          success: false,
          errorMessage: `No library found for file path: ${filePath}`,
        };
      }

      // Check if comic book already exists
      const { db } = await import("#infrastructure/db/sqlite/client.ts").then(m => ({
        db: m.getClient().db
      }));
      
      if (!db) {
        throw new Error("Database client is not initialized");
      }

      const { comicBooksTable } = await import("#infrastructure/db/sqlite/schemas/index.ts");
      const { eq } = await import("drizzle-orm");
      
      const [existingComic] = await db
        .select()
        .from(comicBooksTable)
        .where(eq(comicBooksTable.filePath, filePath));

      let comicBookId: number;

      if (existingComic) {
        // Comic exists - check if hash changed
        if (existingComic.hash === fileHash) {
          queueLogger.info(
            `[FileDetectedHandler] Comic already exists with same hash, skipping: ${filePath}`
          );
          
          // Move directly to completed state
          await ComicBookIngestionModel.updateState(
            record.id,
            "COMIC_INGESTION_COMPLETED",
            { filePath, comicBookId: existingComic.id, reason: "unchanged" }
          );

          return {
            success: true,
            data: { comicBookId: existingComic.id, unchanged: true },
          };
        }

        // Hash changed - will need to reprocess
        queueLogger.info(
          `[FileDetectedHandler] Comic hash changed, will reprocess: ${filePath}`
        );
        comicBookId = existingComic.id;
        
      } else {
        // Create new comic book record with minimal information
        const newComicBook: NewComicBook = {
          libraryId: library.id,
          filePath,
          hash: fileHash,
          title: fileName, // Temporary - will be updated with metadata
          series: "Unknown Series", // Temporary
          issueNumber: "1", // Temporary
          fileSize,
        };

        const [inserted] = await db
          .insert(comicBooksTable)
          .values(newComicBook)
          .returning();

        comicBookId = inserted.id;
        queueLogger.info(
          `[FileDetectedHandler] Created new comic book record with ID: ${comicBookId}`
        );
      }

      // Update ingestion record to next state
      await ComicBookIngestionModel.updateState(
        record.id,
        "METADATA_EXTRACTION",
        { 
          filePath, 
          comicBookId,
          fileHash,
          fileName,
          fileSize,
          libraryId: library.id,
        }
      );

      return {
        success: true,
        data: { comicBookId, filePath, fileHash },
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
