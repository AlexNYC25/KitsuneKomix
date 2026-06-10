import { queueLogger } from "#logger/loggers.ts";
import { WorkerManager } from "./worker-manager.ts";

import { WORKER_CONFIG } from "#config/worker.ts";

/**
 * Main entry point for the ingestion worker process.
 * 
 * This file is imported by the worker.ts script in the API root
 * and starts the worker manager that processes comic ingestion jobs.
 */

// Create and configure the worker manager
const workerManager = new WorkerManager(WORKER_CONFIG);

/**
 * Start the worker manager
 */
export async function startWorker() {
  queueLogger.info("[Worker] Starting ingestion worker...");
  
  try {
    await workerManager.start();
    queueLogger.info("[Worker] Ingestion worker started successfully");
  } catch (error) {
    queueLogger.error(
      `[Worker] Failed to start ingestion worker: ${error instanceof Error ? error.message : String(error)}`
    );
    throw error;
  }
}

/**
 * Stop the worker manager gracefully
 */
export async function stopWorker() {
  queueLogger.info("[Worker] Stopping ingestion worker...");
  
  try {
    await workerManager.stop();
    queueLogger.info("[Worker] Ingestion worker stopped successfully");
  } catch (error) {
    queueLogger.error(
      `[Worker] Error stopping ingestion worker: ${error instanceof Error ? error.message : String(error)}`
    );
    throw error;
  }
}

/**
 * Get the current status of the worker
 */
export function getWorkerStatus() {
  return workerManager.getStatus();
}

/**
 * Process a specific job by ID (for manual triggering/debugging)
 */
export async function processJobById(jobId: number) {
  return await workerManager.processJobById(jobId);
}

// Handle process signals for graceful shutdown
if (typeof Deno !== "undefined") {
  Deno.addSignalListener("SIGINT", async () => {
    queueLogger.info("[Worker] Received SIGINT signal");
    await stopWorker();
    Deno.exit(0);
  });

  Deno.addSignalListener("SIGTERM", async () => {
    queueLogger.info("[Worker] Received SIGTERM signal");
    await stopWorker();
    Deno.exit(0);
  });
}

