import { queueLogger } from "#logger/loggers.ts";
import { ComicBookIngestionModel } from "#infrastructure/db/sqlite/models/comicBookIngestion.model.ts";
import { getClient } from "#infrastructure/db/sqlite/client.ts";
import { comicBooksTable } from "#infrastructure/db/sqlite/schemas/index.ts";
import { eq } from "drizzle-orm";

/**
 * Service for enqueuing files for ingestion.
 * 
 * This is used by the file watcher to add new files to the ingestion queue.
 */
export class IngestionQueueService {
  /**
   * Enqueue a file for processing
   * 
   * This will:
   * 1. Check if the file is already in the ingestion queue
   * 2. Check if a comic book record exists for this file
   * 3. Create an ingestion record if needed
   * 
   * @param filePath The absolute path to the comic file
   * @returns The ID of the ingestion record, or null if already queued
   */
  static async enqueueFile(filePath: string): Promise<number | null> {
    try {
      queueLogger.info(`[IngestionQueue] Enqueuing file: ${filePath}`);

      const { db } = getClient();
      if (!db) {
        throw new Error("Database client is not initialized");
      }

      // Check if there's already a comic book for this file path
      const [existingComic] = await db
        .select()
        .from(comicBooksTable)
        .where(eq(comicBooksTable.filePath, filePath));

      let comicBookId: number | undefined;

      if (existingComic) {
        comicBookId = existingComic.id;
        
        // Check if there's already an active ingestion record for this comic
        const existingIngestion = await ComicBookIngestionModel.getByComicBookId(
          comicBookId
        );

        if (existingIngestion) {
          // Check if it's completed or failed
          if (existingIngestion.state === "COMIC_INGESTION_COMPLETED") {
            queueLogger.info(
              `[IngestionQueue] Comic already ingested, creating new ingestion record for update`
            );
          } else if (existingIngestion.state === "FAILED") {
            queueLogger.info(
              `[IngestionQueue] Previous ingestion failed, creating new attempt`
            );
          } else {
            queueLogger.info(
              `[IngestionQueue] File already in queue (state: ${existingIngestion.state})`
            );
            return null; // Already being processed
          }
        }
      }

      // Create a new ingestion record
      const record = await ComicBookIngestionModel.create(
        comicBookId || 0, // Will be updated by FILE_DETECTED handler if 0
        "FILE_DETECTED"
      );

      // Store the file path in metadata for the first handler
      await ComicBookIngestionModel.updateState(
        record.id,
        "FILE_DETECTED",
        { filePath }
      );

      queueLogger.info(
        `[IngestionQueue] Created ingestion record ${record.id} for file: ${filePath}`
      );

      return record.id;
    } catch (error) {
      queueLogger.error(
        `[IngestionQueue] Error enqueuing file: ${error instanceof Error ? error.message : String(error)}`
      );
      throw error;
    }
  }

  /**
   * Enqueue multiple files at once
   * 
   * @param filePaths Array of file paths to enqueue
   * @returns Array of ingestion record IDs (null for skipped files)
   */
  static async enqueueFiles(filePaths: string[]): Promise<(number | null)[]> {
    const results: (number | null)[] = [];

    for (const filePath of filePaths) {
      try {
        const recordId = await this.enqueueFile(filePath);
        results.push(recordId);
      } catch (error) {
        queueLogger.error(
          `[IngestionQueue] Failed to enqueue ${filePath}: ${error instanceof Error ? error.message : String(error)}`
        );
        results.push(null);
      }
    }

    return results;
  }

  /**
   * Get the current queue size (pending jobs)
   */
  static async getQueueSize(): Promise<number> {
    const pendingJobs = await ComicBookIngestionModel.getPendingJobs(1000);
    return pendingJobs.length;
  }
}
