import { Queue, QueueEvents, QueueOptions } from "bullmq";

import { redisConnection } from "#infrastructure/db/redis/client.ts";

import { 
  standardWorkerError, 
  workerEventCompleted, 
  workerEventFailed 
} from "#utilities/workers.ts";

const defaultQueueOptions: QueueOptions = {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: false,
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000, // Initial delay of 5 seconds
    },
  },
};

// Define the main application queue for processing tasks
export const appQueue = new Queue("appQueue", defaultQueueOptions);

// Add connection event handlers
appQueue.on("error", standardWorkerError);

// Creates the event listeners for the main application queue: "appQueue"
export const appQueueEvents = new QueueEvents("appQueue", {
  connection: redisConnection,
});

appQueueEvents.on("completed", workerEventCompleted);

appQueueEvents.on("failed", workerEventFailed);

appQueueEvents.on("error", standardWorkerError);


export const fileOrchestrationQueue = new Queue("fileOrchestrationQueue", defaultQueueOptions);

fileOrchestrationQueue.on("error", standardWorkerError);
  
export const fileOrchestrationQueueEvents = new QueueEvents("fileOrchestrationQueue", {
  connection: redisConnection,
});

fileOrchestrationQueueEvents.on("completed", workerEventCompleted);

fileOrchestrationQueueEvents.on("failed", workerEventFailed);

fileOrchestrationQueueEvents.on("error", standardWorkerError);


export const fileQueue = new Queue("files", defaultQueueOptions);

fileQueue.on("error", standardWorkerError);

export const fileQueueEvents = new QueueEvents("files", {
  connection: redisConnection,
});

fileQueueEvents.on("completed", workerEventCompleted);

fileQueueEvents.on("failed", workerEventFailed);

fileQueueEvents.on("error", standardWorkerError);

/**
 * The Series Queue is responsible for processing series information and linking comic books to their respective series based on the parent folder structure 
 * It handles the creation of new series records in the database if they don't already exist, and ensures that comic books are properly associated with their series.
 */
export const seriesQueue = new Queue("comicSeries", defaultQueueOptions);

seriesQueue.on("error", standardWorkerError);

export const seriesQueueEvents = new QueueEvents("comicSeries", {
  connection: redisConnection,
});

seriesQueueEvents.on("completed", workerEventCompleted);

seriesQueueEvents.on("failed", workerEventFailed);

seriesQueueEvents.on("error", standardWorkerError);

/**
 * The Comic Book Queue is responsible for the detailed processing of comic book files, including metadata extraction, thumbnail generation, and database insertion/updating.
 * It works closely with the file queue to receive jobs for new or updated comic files, and ensures that all necessary processing steps are completed before finalizing the comic book record in the database.
 */
export const comicBookQueue = new Queue("comicBooks", defaultQueueOptions);

comicBookQueue.on("error", standardWorkerError);

export const comicBookQueueEvents = new QueueEvents("comicBooks", {
  connection: redisConnection,
});

comicBookQueueEvents.on("completed", workerEventCompleted);

comicBookQueueEvents.on("failed", workerEventFailed);

comicBookQueueEvents.on("error", standardWorkerError);