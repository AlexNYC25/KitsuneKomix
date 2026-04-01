import { seriesQueue } from "#app/queues.ts";

import { queueLogger } from "#logger/loggers.ts";

import { loadMetadataIntoCache, standardizeMetadata } from "#utilities/metadata.ts";

import { StandardizedComicMetadata } from "#interfaces/index.ts";
import type {
  WorkerFileJob
} from "#types/index.ts";



/**
 * Job processor for the "extract-metadata" job
 * Handle extracting and standardizing metadata from the comic file,
 * caching it for later use by the other workers,
 * then enqueues the next job in the workflow for processing the comic book with the extracted metadata.
 * 
 * @param job The file data for the actual logic
 */
export const prepareMetadataForWorkers = async (job: WorkerFileJob) => {
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