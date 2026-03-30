import { Worker } from "bullmq";

import { redisConnection } from "#db/redis/client.ts";

import { queueLogger } from "#logger/loggers.ts";

import { queueNames } from "#config/queues.ts";

import { 
	processComicSeries, 
	processAddingANewComicSeries, 
	processComicLibraryLinkingToSeries 
} from "../jobs/comicSeries.jobs.ts";

import type {
	WorkerFileJob,
	WorkerLibrarySeriesJob
} from "#types/index.ts";

export const seriesWorker = new Worker(
	queueNames.COMIC_SERIES_QUEUE,
	async (job) => {
		switch (job.name) {
			case "process-comic-series":
				await processComicSeries(job.data as WorkerFileJob);
				break;
			case "add-new-comic-series":
				await processAddingANewComicSeries(job.data as WorkerFileJob);
				break;
			case "add-series-to-library":
				await processComicLibraryLinkingToSeries(job.data as WorkerLibrarySeriesJob);
				break;
			default:
				queueLogger.warn(`No processor defined for job name: ${job.name}`);
		}
	},
	{ connection: redisConnection }
);