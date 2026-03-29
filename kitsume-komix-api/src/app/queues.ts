import { Queue, QueueEvents, QueueOptions } from "bullmq";

import { redisConnection } from "#infrastructure/db/redis/client.ts";

import { 
  standardWorkerError, 
  workerEventCompleted, 
  workerEventFailed 
} from "#infrastructure/queue/callbacks.ts";

import { defaultQueueOptions, queueNames } from "#config/queues.ts";

// Define the main application queue for processing tasks
export const appQueue = new Queue(queueNames.APP_QUEUE, defaultQueueOptions);

// Add connection event handlers
appQueue.on("error", standardWorkerError);

// Creates the event listeners for the main application queue: "appQueue"
export const appQueueEvents = new QueueEvents(queueNames.APP_QUEUE, {
  connection: redisConnection,
});

appQueueEvents.on("completed", workerEventCompleted);

appQueueEvents.on("failed", workerEventFailed);

appQueueEvents.on("error", standardWorkerError);


export const fileOrchestrationQueue = new Queue(queueNames.FILE_ORCHESTRATION_QUEUE, defaultQueueOptions);

fileOrchestrationQueue.on("error", standardWorkerError);
  
export const fileOrchestrationQueueEvents = new QueueEvents(queueNames.FILE_ORCHESTRATION_QUEUE, {
  connection: redisConnection,
});

fileOrchestrationQueueEvents.on("completed", workerEventCompleted);

fileOrchestrationQueueEvents.on("failed", workerEventFailed);

fileOrchestrationQueueEvents.on("error", standardWorkerError);


export const fileQueue = new Queue(queueNames.FILE_QUEUE, defaultQueueOptions);

fileQueue.on("error", standardWorkerError);

export const fileQueueEvents = new QueueEvents(queueNames.FILE_QUEUE, {
  connection: redisConnection,
});

fileQueueEvents.on("completed", workerEventCompleted);

fileQueueEvents.on("failed", workerEventFailed);

fileQueueEvents.on("error", standardWorkerError);

/**
 * The Series Queue is responsible for processing series information and linking comic books to their respective series based on the parent folder structure 
 * It handles the creation of new series records in the database if they don't already exist, and ensures that comic books are properly associated with their series.
 */
export const seriesQueue = new Queue(queueNames.COMIC_SERIES_QUEUE, defaultQueueOptions);

seriesQueue.on("error", standardWorkerError);

export const seriesQueueEvents = new QueueEvents(queueNames.COMIC_SERIES_QUEUE, {
  connection: redisConnection,
});

seriesQueueEvents.on("completed", workerEventCompleted);

seriesQueueEvents.on("failed", workerEventFailed);

seriesQueueEvents.on("error", standardWorkerError);

/**
 * The Comic Book Queue is responsible for the detailed processing of comic book files, including metadata extraction, thumbnail generation, and database insertion/updating.
 * It works closely with the file queue to receive jobs for new or updated comic files, and ensures that all necessary processing steps are completed before finalizing the comic book record in the database.
 */
export const comicBookQueue = new Queue(queueNames.COMIC_BOOK_QUEUE, defaultQueueOptions);

comicBookQueue.on("error", standardWorkerError);

export const comicBookQueueEvents = new QueueEvents(queueNames.COMIC_BOOK_QUEUE, {
  connection: redisConnection,
});

comicBookQueueEvents.on("completed", workerEventCompleted);

comicBookQueueEvents.on("failed", workerEventFailed);

comicBookQueueEvents.on("error", standardWorkerError);