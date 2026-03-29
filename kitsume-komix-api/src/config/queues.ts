import { QueueOptions } from "bullmq";

import { redisConnection } from "#infrastructure/db/redis/client.ts";

export const queueNames = {
  APP_QUEUE: "appQueue",
	FILE_ORCHESTRATION_QUEUE: "fileOrchestrationQueue",
	FILE_QUEUE: "files",
	COMIC_SERIES_QUEUE: "comicSeries",
	COMIC_BOOK_QUEUE: "comicBooks",
}

export const defaultQueueOptions: QueueOptions = {
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