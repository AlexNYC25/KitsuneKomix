import { Worker } from "bullmq";

import { redisConnection } from "#db/redis/client.ts";

import { queueLogger } from "#logger/loggers.ts";

import { queueNames } from "#config/queues.ts";

import { prepareMetadataForWorkers } from "../jobs/file.jobs.ts";
import { WorkerFileJob } from "#types/index.ts";

export const fileWorker = new Worker(
	queueNames.FILE_QUEUE,
	async (job) => {
		switch (job.name) {
			case "extract-metadata":
				await prepareMetadataForWorkers(job.data as WorkerFileJob);
				break;
			default:
				queueLogger.warn(`No processor defined for job name: ${job.name}`);
		}
	},
	{ connection: redisConnection }
)