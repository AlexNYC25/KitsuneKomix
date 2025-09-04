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

appQueueEvents.on("completed", ({ jobId }) => {
  queueLogger.info(`Job ${jobId} has completed`);
});

appQueueEvents.on("failed", ({ jobId, failedReason }) => {
  queueLogger.error(`Job ${jobId} has failed with reason: ${failedReason}`);
});

appQueueEvents.on("error", (error) => {
  queueLogger.error(`Queue error: ${error}`);
});