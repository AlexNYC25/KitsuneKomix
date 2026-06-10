import { queueLogger } from "#logger/loggers.ts";
import { ComicBookIngestionModel } from "#infrastructure/db/sqlite/models/comicBookIngestion.model.ts";

import {
  FileDetectedHandler,
  MetadataExtractionHandler,
  MetadataCandidatesCreationHandler,
  MetadataEntitiesResolutionHandler,
  ComicLinksBuilderHandler,
} from "./handlers/index.ts";

import type { ComicBookIngestionRecord, IngestionState, JobHandler, JobHandlerResult } from "#types/index.ts";

/**
 * Worker class that processes ingestion jobs.
 * 
 * The worker:
 * - Takes an ingestion record
 * - Determines the appropriate handler based on current state
 * - Executes the handler
 * - Updates the record on success/failure
 */
export class IngestionWorker {
  private handlers: Map<IngestionState, JobHandler>;

  constructor() {
    // Initialize handlers for each state
    this.handlers = new Map([
      ["FILE_DETECTED", new FileDetectedHandler()],
      ["METADATA_EXTRACTION", new MetadataExtractionHandler()],
      ["METADATA_CANDIDATES_CREATED", new MetadataCandidatesCreationHandler()],
      ["METADATA_ENTITIES_RESOLVED", new MetadataEntitiesResolutionHandler()],
      ["COMIC_LINKS_BUILT", new ComicLinksBuilderHandler()],
    ]);
  }

  /**
   * Process a single ingestion job
   * 
   * @param record The ingestion record to process
   * @returns The result of the handler execution
   */
  async processJob(record: ComicBookIngestionRecord): Promise<JobHandlerResult> {
    const state = record.state;

    if (!state) {
      queueLogger.error(`[Worker] Record ${record.id} has no state`);
      return {
        success: false,
        errorMessage: "Record has no state",
      };
    }

    // Skip already completed jobs
    if (state === "COMIC_INGESTION_COMPLETED") {
      queueLogger.info(
        `[Worker] Record ${record.id} already completed, skipping`
      );
      return {
        success: true,
        data: { alreadyCompleted: true },
      };
    }

    // Skip failed jobs (they should be manually retried)
    if (state === "FAILED") {
      queueLogger.warn(
        `[Worker] Record ${record.id} is in FAILED state, skipping`
      );
      return {
        success: false,
        errorMessage: "Job is in FAILED state",
      };
    }

    const handler = this.handlers.get(state);

    if (!handler) {
      const errorMessage = `No handler found for state: ${state}`;
      queueLogger.error(`[Worker] ${errorMessage}`);
      
      await ComicBookIngestionModel.markAsFailed(record.id, errorMessage);
      
      return {
        success: false,
        errorMessage,
      };
    }

    queueLogger.info(
      `[Worker] Processing record ${record.id} (Comic ID: ${record.comicBookId}) in state: ${state}`
    );

    try {
      const result = await handler.handle(record);

      if (!result.success) {
        // Handler failed - mark the job as failed
        await ComicBookIngestionModel.markAsFailed(
          record.id,
          result.errorMessage || "Handler failed without error message"
        );
        
        queueLogger.error(
          `[Worker] Handler failed for record ${record.id}: ${result.errorMessage}`
        );
      } else {
        queueLogger.info(
          `[Worker] Successfully processed record ${record.id}`
        );
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      queueLogger.error(
        `[Worker] Unexpected error processing record ${record.id}: ${errorMessage}`
      );
      
      await ComicBookIngestionModel.markAsFailed(record.id, errorMessage);
      
      return {
        success: false,
        errorMessage,
      };
    }
  }

  /**
   * Process multiple jobs in sequence
   * 
   * @param records Array of ingestion records to process
   * @returns Array of results
   */
  async processJobs(records: ComicBookIngestionRecord[]): Promise<JobHandlerResult[]> {
    const results: JobHandlerResult[] = [];

    for (const record of records) {
      const result = await this.processJob(record);
      results.push(result);
    }

    return results;
  }
}
