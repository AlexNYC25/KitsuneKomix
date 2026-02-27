import { Queue, QueueEvents, QueueOptions } from "bullmq";
import { redisConnection } from "../db/redis/redisConnection.ts";
import { queueLogger } from "../logger/loggers.ts";

export const appQueue = new Queue("appQueue", {
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
} as QueueOptions);

export const appQueueEvents = new QueueEvents("appQueue", {
  connection: redisConnection,
});

// Add connection event handlers
appQueue.on("error", (error) => {
  //console.error("Queue connection error:", error);
  queueLogger.error(`Queue connection error: ${error}`);
});

appQueueEvents.on("completed", ({ jobId }) => {
  //console.log(`Queue event: Job ${jobId} completed`);
  queueLogger.info(`Job ${jobId} has completed`);
});

appQueueEvents.on("failed", ({ jobId, failedReason }) => {
  //console.log(`Queue event: Job ${jobId} failed - ${failedReason}`);
  queueLogger.error(`Job ${jobId} has failed with reason: ${failedReason}`);
});

appQueueEvents.on("error", (error) => {
  console.error("Queue events error:", error);
  queueLogger.error(`Queue error: ${error}`);
});

/**
 * File Queue for processing new or updated comic files.
 * 
 * This queue is specifically designed to be the initial point of entry
 * - loads data into redis for quick access by the workers
 * - checks if the file has been processed before by comparing hashes
 * - checks if the parent folder of the comic file is registered as a series and if not, queues a follow-up job to process the series information
 * - builds the workflow for processing the comic file and inserting/updating the database record with the extracted metadata and generated thumbnails
 */
export const fileQueue = new Queue("fileProcessingQueue", {
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
} as QueueOptions);

export const fileQueueEvents = new QueueEvents("fileProcessingQueue", {
  connection: redisConnection,
});

fileQueue.on("error", (error) => {
  //console.error("File queue connection error:", error);
  queueLogger.error(`File queue connection error: ${error}`);
});

fileQueueEvents.on("completed", ({ jobId }) => {
  //console.log(`File queue event: Job ${jobId} completed`);
  queueLogger.info(`File processing job ${jobId} has completed`);
});

fileQueueEvents.on("failed", ({ jobId, failedReason }) => {
  //console.log(`File queue event: Job ${jobId} failed - ${failedReason}`);
  queueLogger.error(`File processing job ${jobId} has failed with reason: ${failedReason}`);
});

fileQueueEvents.on("error", (error) => {
  console.error("File queue events error:", error);
  queueLogger.error(`File queue error: ${error}`);
});

/**
 * The Series Queue is responsible for processing series information and linking comic books to their respective series based on the parent folder structure 
 * It handles the creation of new series records in the database if they don't already exist, and ensures that comic books are properly associated with their series.
 */
export const seriesQueue = new Queue("seriesProcessingQueue", {
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
} as QueueOptions);

export const seriesQueueEvents = new QueueEvents("seriesProcessingQueue", {
  connection: redisConnection,
});

seriesQueue.on("error", (error) => {
  //console.error("Series queue connection error:", error);
  queueLogger.error(`Series queue connection error: ${error}`);
});

seriesQueueEvents.on("completed", ({ jobId }) => {
  //console.log(`Series queue event: Job ${jobId} completed`);
  queueLogger.info(`Series processing job ${jobId} has completed`);
});

seriesQueueEvents.on("failed", ({ jobId, failedReason }) => {
  //console.log(`Series queue event: Job ${jobId} failed - ${failedReason}`);
  queueLogger.error(`Series processing job ${jobId} has failed with reason: ${failedReason}`);
});

seriesQueueEvents.on("error", (error) => {
  console.error("Series queue events error:", error);
  queueLogger.error(`Series queue error: ${error}`);
});

/**
 * The Comic Book Queue is responsible for the detailed processing of comic book files, including metadata extraction, thumbnail generation, and database insertion/updating.
 * It works closely with the file queue to receive jobs for new or updated comic files, and ensures that all necessary processing steps are completed before finalizing the comic book record in the database.
 */
export const comicBookQueue = new Queue("comicBookProcessingQueue", {
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
} as QueueOptions);

export const comicBookQueueEvents = new QueueEvents("comicBookProcessingQueue", {
  connection: redisConnection,
});

comicBookQueue.on("error", (error) => {
  //console.error("Comic book queue connection error:", error);
  queueLogger.error(`Comic book queue connection error: ${error}`);
});

comicBookQueueEvents.on("completed", ({ jobId }) => {
  //console.log(`Comic book queue event: Job ${jobId} completed`);
  queueLogger.info(`Comic book processing job ${jobId} has completed`);
});

comicBookQueueEvents.on("failed", ({ jobId, failedReason }) => {
  //console.log(`Comic book queue event: Job ${jobId} failed - ${failedReason}`);
  queueLogger.error(`Comic book processing job ${jobId} has failed with reason: ${failedReason}`);
});

comicBookQueueEvents.on("error", (error) => {
  console.error("Comic book queue events error:", error);
  queueLogger.error(`Comic book queue error: ${error}`);
});