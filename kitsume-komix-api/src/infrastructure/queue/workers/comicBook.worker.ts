import { Worker } from "bullmq";
import { redisConnection } from "#db/redis/client.ts";
import { queueLogger } from "#logger/loggers.ts";

import {
	saveComicBook,
	saveComicBookMetadata,
	processComicBookImages
} from "../jobs/comicBook.jobs.ts";

export const comicBookWorker = new Worker(
	"comicBooks",
	async (job) => {
		switch (job.name) {
			case "save-comic-book":
				return await saveComicBook(job.data as unknown as { filePath: string; seriesId: number });
			case "save-metadata":
				await saveComicBookMetadata(job.data as unknown as { comicId: number; filePath: string });
				break;
			case "process-comic-book-images":
				await processComicBookImages(job.data as unknown as { comicId: number; filePath: string });
				break;
			default:
				queueLogger.warn(`No processor defined for job name: ${job.name}`);
		}
	},
	{ connection: redisConnection }
)