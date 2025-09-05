import { Queue, QueueEvents, QueueOptions } from "bullmq";
import { redisConnection } from "../config/db/redisConnection.ts";
import { queueLogger } from "../config/logger/loggers.ts";

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
  console.error("Queue connection error:", error);
  queueLogger.error(`Queue connection error: ${error}`);
});

appQueueEvents.on("completed", ({ jobId }) => {
  console.log(`Queue event: Job ${jobId} completed`);
  queueLogger.info(`Job ${jobId} has completed`);
});

appQueueEvents.on("failed", ({ jobId, failedReason }) => {
  console.log(`Queue event: Job ${jobId} failed - ${failedReason}`);
  queueLogger.error(`Job ${jobId} has failed with reason: ${failedReason}`);
});

appQueueEvents.on("error", (error) => {
  console.error("Queue events error:", error);
  queueLogger.error(`Queue error: ${error}`);
});

console.log("Queue and queue events initialized");