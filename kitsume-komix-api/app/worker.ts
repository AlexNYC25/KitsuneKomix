import { Queue, QueueEvents, QueueOptions } from "bullmq";

import { redisConnection } from "#infrastructure/db/redis/client.ts";
import { queueLogger } from "#infrastructure/logger/loggers.ts";

// Define the main application queue for processing tasks
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

// Add connection event handlers
appQueue.on("error", (error) => {
  //console.error("Queue connection error:", error);
  queueLogger.error(`Queue connection error: ${error}`);
});

// Creates the event listeners for the main application queue: "appQueue"
export const appQueueEvents = new QueueEvents("appQueue", {
  connection: redisConnection,
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


export const fileOrchestrationQueue = new Queue("fileOrchestrationQueue", {
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

fileOrchestrationQueue.on("error", (error) => {
  //console.error("File orchestration queue connection error:", error);
  queueLogger.error(`File orchestration queue connection error: ${error}`);
});

export const fileOrchestrationQueueEvents = new QueueEvents("fileOrchestrationQueue", {
  connection: redisConnection,
});

fileOrchestrationQueueEvents.on("completed", ({ jobId }) => {
  //console.log(`File orchestration queue event: Job ${jobId} completed`);
  queueLogger.info(`File orchestration job ${jobId} has completed`);
});

fileOrchestrationQueueEvents.on("failed", ({ jobId, failedReason }) => {
  //console.log(`File orchestration queue event: Job ${jobId} failed - ${failedReason}`);
  queueLogger.error(`File orchestration job ${jobId} has failed with reason: ${failedReason}`);
});

fileOrchestrationQueueEvents.on("error", (error) => {
  console.error("File orchestration queue events error:", error);
  queueLogger.error(`File orchestration queue error: ${error}`);
});


export const fileQueue = new Queue("files", {
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

export const fileQueueEvents = new QueueEvents("files", {
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
export const seriesQueue = new Queue("comicSeries", {
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

export const seriesQueueEvents = new QueueEvents("comicSeries", {
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
export const comicBookQueue = new Queue("comicBooks", {
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

export const comicBookQueueEvents = new QueueEvents("comicBooks", {
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