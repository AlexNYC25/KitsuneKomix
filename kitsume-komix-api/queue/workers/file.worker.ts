import { Worker } from "bullmq";
import { redisConnection } from "../../db/redis/redisConnection.ts";

import { comicBookQueue, seriesQueue } from "../index.ts";

import { queueLogger } from "../../logger/loggers.ts";

import { standardizeMetadata, loadMetadataIntoCache } from "#utilities/metadata.ts";

import { 
	WorkerJob,
} from "#types/index.ts";
import { StandardizedComicMetadata } from "#interfaces/index.ts";

/**
 * Job processor for the "extract-metadata" job
 * Handle extracting and standardizing metadata from the comic file,
 * caching it for later use by the other workers,
 * then enqueues the next job in the workflow for processing the comic book with the extracted metadata.
 * 
 * @param job The file data for the actual logic
 */
const prepareMetadataForWorkers = async (job: { filePath: string }) => {
	const filePath: string = job.filePath;

	queueLogger.info(`Starting metadata extraction for file: ${filePath}`);

	const standardizedMetadata: StandardizedComicMetadata | undefined =
      await standardizeMetadata(filePath);
		
	if (standardizedMetadata) {
		queueLogger.info(`Metadata extraction successful for file: ${filePath}`);
		// save the metadata to the redis cache for later retrieval by comicBookWorker
		loadMetadataIntoCache(filePath, standardizedMetadata);
	}

	// Enqueue the next job in the workflow, passing along the file path
	seriesQueue.add("process-comic-series", {
		filePath,
	});
};

export const fileWorker = new Worker(
	"files",
	async (job) => {
		switch (job.name) {
			case "extract-metadata":
				await prepareMetadataForWorkers(job.data as unknown as { filePath: string });
				break;
			default:
				queueLogger.warn(`No processor defined for job name: ${job.name}`);
		}
	},
	{ connection: redisConnection }
)