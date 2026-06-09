import type { WorkerManagerConfig } from "#types/index.ts";

export const WORKER_CONFIG: WorkerManagerConfig = {
  pollInterval: 5000, // Poll every 5 seconds
  batchSize: 10, // Process up to 10 jobs per poll
  concurrency: 1, // Process jobs sequentially (can be increased for parallel processing)
}