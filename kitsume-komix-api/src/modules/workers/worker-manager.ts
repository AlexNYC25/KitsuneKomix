import { queueLogger } from "#logger/loggers.ts";
import { ComicBookIngestionModel } from "#infrastructure/db/sqlite/models/comicBookIngestion.model.ts";
import { IngestionWorker } from "./ingestion-worker.ts";

import type { WorkerManagerConfig } from "#types/index.ts";

/**
 * Worker Manager that coordinates the ingestion pipeline.
 * 
 * The manager:
 * - Polls the comic_book_ingestion table for pending jobs
 * - Dispatches jobs to workers
 * - Manages the polling loop
 * - Handles graceful shutdown
 */
export class WorkerManager {
  private worker: IngestionWorker;
  private pollInterval: number;
  private batchSize: number;
  private concurrency: number;
  private isRunning: boolean = false;
  private pollTimer: number | null = null;
  private shutdownPromise: Promise<void> | null = null;
  private resolveShutdown: (() => void) | null = null;

  constructor(config: WorkerManagerConfig = {}) {
    this.worker = new IngestionWorker();
    this.pollInterval = config.pollInterval ?? 5000; // Default: 5 seconds
    this.batchSize = config.batchSize ?? 10; // Default: 10 jobs per batch
    this.concurrency = config.concurrency ?? 1; // Default: sequential processing
  }

  /**
   * Start the worker manager polling loop
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      queueLogger.warn("[WorkerManager] Already running");
      return;
    }

    this.isRunning = true;
    this.shutdownPromise = new Promise((resolve) => {
      this.resolveShutdown = resolve;
    });

    queueLogger.info(
      `[WorkerManager] Starting with poll interval: ${this.pollInterval}ms, batch size: ${this.batchSize}`
    );

    // Start the polling loop
    await this.poll();
  }

  /**
   * Stop the worker manager
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      queueLogger.warn("[WorkerManager] Not running");
      return;
    }

    queueLogger.info("[WorkerManager] Stopping...");
    this.isRunning = false;

    // Clear any pending poll timer
    if (this.pollTimer !== null) {
      clearTimeout(this.pollTimer);
      this.pollTimer = null;
    }

    // Resolve the shutdown promise
    if (this.resolveShutdown) {
      this.resolveShutdown();
    }

    // Wait for shutdown to complete
    if (this.shutdownPromise) {
      await this.shutdownPromise;
    }

    queueLogger.info("[WorkerManager] Stopped");
  }

  /**
   * Poll the database for pending jobs and process them
   */
  private async poll(): Promise<void> {
    while (this.isRunning) {
      try {
        await this.processPendingJobs();
      } catch (error) {
        queueLogger.error(
          `[WorkerManager] Error during polling: ${error instanceof Error ? error.message : String(error)}`
        );
      }

      // Wait for the next poll interval
      if (this.isRunning) {
        await this.sleep(this.pollInterval);
      }
    }
  }

  /**
   * Fetch and process pending jobs from the database
   */
  private async processPendingJobs(): Promise<void> {
    // Fetch pending jobs
    const pendingJobs = await ComicBookIngestionModel.getPendingJobs(
      this.batchSize
    );

    if (pendingJobs.length === 0) {
      // No jobs to process
      return;
    }

    queueLogger.info(
      `[WorkerManager] Found ${pendingJobs.length} pending job(s)`
    );

    // Process jobs
    if (this.concurrency === 1) {
      // Sequential processing
      for (const job of pendingJobs) {
        if (!this.isRunning) break; // Stop if shutdown was requested
        await this.worker.processJob(job);
      }
    } else {
      // Parallel processing (batched)
      const batches = this.chunkArray(pendingJobs, this.concurrency);
      
      for (const batch of batches) {
        if (!this.isRunning) break; // Stop if shutdown was requested
        
        await Promise.all(
          batch.map((job) => this.worker.processJob(job))
        );
      }
    }
  }

  /**
   * Sleep for a specified duration
   * @param ms Milliseconds to sleep
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      this.pollTimer = setTimeout(resolve, ms) as unknown as number;
    });
  }

  /**
   * Split an array into chunks
   * @param array Array to split
   * @param chunkSize Size of each chunk
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Get the current status of the manager
   */
  getStatus(): { isRunning: boolean; pollInterval: number; batchSize: number; concurrency: number } {
    return {
      isRunning: this.isRunning,
      pollInterval: this.pollInterval,
      batchSize: this.batchSize,
      concurrency: this.concurrency,
    };
  }

  /**
   * Process a single job immediately (for testing/manual triggering)
   * @param jobId The ingestion record ID to process
   */
  async processJobById(jobId: number): Promise<void> {
    const record = await ComicBookIngestionModel.getById(jobId);
    
    if (!record) {
      throw new Error(`No ingestion record found with ID: ${jobId}`);
    }

    await this.worker.processJob(record);
  }
}
