import { Worker } from "bullmq";
import { redisConnection } from "#db/redis/client.ts";
import { queueLogger } from "#logger/loggers.ts";

import { queueNames } from "#config/queues.ts";

import type {
	WorkerComicFileJob,
	WorkerFilePathSeriesJob,
} from "#types/index.ts";

import {
	saveComicBook,
	saveComicBookMetadata,
	processComicBookImages
} from "#infrastructure/queue/jobs/comicBook.jobs.ts";

export const comicBookWorker = new Worker(
	queueNames.COMIC_BOOK_QUEUE,
	async (job) => {
		switch (job.name) {
			case "save-comic-book":
				return await saveComicBook(job.data as WorkerFilePathSeriesJob);
			case "save-metadata":
				await saveComicBookMetadata(job.data as WorkerComicFileJob);
				break;
			case "process-comic-book-images":
				await processComicBookImages(job.data as WorkerComicFileJob);
				break;
			default:
				queueLogger.warn(`No processor defined for job name: ${job.name}`);
		}
	},
	{ connection: redisConnection }
)