import { Queue, QueueEvents } from "bullmq";

import { redisConnection } from "#db/redis/client.ts";

import {
  standardWorkerError,
  workerEventCompleted,
  workerEventFailed,
} from "#infrastructure/queue/callbacks.ts";

import { defaultQueueOptions, queueNames } from "#config/queues.ts";

function createQueueWithEvents(queueName: string) {
  const queue = new Queue(queueName, defaultQueueOptions);
  queue.on("error", standardWorkerError);

  const events = new QueueEvents(queueName, { connection: redisConnection });
  events.on("completed", workerEventCompleted);
  events.on("failed", workerEventFailed);
  events.on("error", standardWorkerError);

  return { queue, events };
}

export const { queue: appQueue, events: appQueueEvents } = createQueueWithEvents(queueNames.APP_QUEUE);

export const { queue: fileQueue, events: fileQueueEvents } = createQueueWithEvents(queueNames.FILE_QUEUE);

export const { queue: seriesQueue, events: seriesQueueEvents } = createQueueWithEvents(queueNames.COMIC_SERIES_QUEUE);

export const { queue: comicBookQueue, events: comicBookQueueEvents } = createQueueWithEvents(queueNames.COMIC_BOOK_QUEUE);