import { Worker } from "bullmq";
import { dirname } from "@std/path";

import { MetadataCompiled } from "npm:comic-metadata-tool";
import { ComicMetadata } from "../../interfaces/ComicMetadata.interface.ts";

import { redisConnection } from "../../db/redis/redisConnection.ts";
import { apiLogger, queueLogger } from "../../config/logger/loggers.ts";

import { getMetadata } from "../../utilities/metadata.ts";
import { insertComicBook } from "../../db/sqlite/models/comicBooks.model.ts";
import { insertComicSeries, getComicSeriesByPath } from "../../db/sqlite/models/comicSeries.model.ts";

import { appQueue } from "../queueManager.ts";

async function processNewComicFile(job: { data: { filePath: string; metadata: object } }): Promise<void> {
  queueLogger.info(`Processing new comic file: ${job.data.filePath}`);
  
  try {
    // Get metadata for the comic file
    const metadata: MetadataCompiled | null = await getMetadata(job.data.filePath);

    const comicData = {
      title: metadata?.comicInfoXml?.title || "Unknown Title",
      tags: metadata?.comicInfoXml?.characters?.split(",").map((s) => s.trim()) || [],
      filePath: job.data.filePath,
      libraryId: 1, // Default library ID for now TODO: Determine library ID based on file path
    };

    // Insert the comic book
    const comicId = await insertComicBook(comicData);
    apiLogger.info(`Inserted new comic book with ID: ${comicId}`);

    // Check if series exists and trigger follow-up job if needed
    const parentPath = dirname(job.data.filePath);
    queueLogger.info(`Checking for comic series at path: ${parentPath}`);
    
    const existingSeries = await getComicSeriesByPath(parentPath);
    
    if (!existingSeries) {
      queueLogger.info(`No existing series found for path: ${parentPath}, adding series processing job to queue`);
      
      // Add follow-up job to process the series
      await appQueue.add("processComicSeries", {
        seriesPath: parentPath, 
        comicId: comicId,
        metadata: metadata
      });
      
      apiLogger.info(`Added series processing job for path: ${parentPath}`);
    } else {
      queueLogger.info(`Series already exists for path: ${parentPath}, series ID: ${existingSeries.id}`);
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    queueLogger.error(`Error processing comic file ${job.data.filePath}: ${errorMessage}`);
    throw error;
  }
}

async function processComicSeries(job: { data: { seriesPath: string; comicId: number; metadata: ComicMetadata } }): Promise<void> {
  try {
    queueLogger.info(`Processing comic series for path: ${job.data.seriesPath}`);
    
    // Extract series name from the path (last directory name)
    const seriesName = dirname(job.data.seriesPath).split('/').pop() || "Unknown Series";
    
    const seriesData = {
      name: job.data.metadata?.comicInfoXml?.series || seriesName,
      folderPath: job.data.seriesPath,
      description: null,
    };

    const seriesId = await insertComicSeries(seriesData);
    apiLogger.info(`Inserted new comic series with ID: ${seriesId} for path: ${job.data.seriesPath}`);
      
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    queueLogger.error(`Error processing comic series ${job.data.seriesPath}: ${errorMessage}`);
    throw error;
  }
}

export const comicFileWorker = new Worker(
	"appQueue",
		async (job) => {
		queueLogger.info(`Worker received job: ${job.name} with ID: ${job.id}`);
		switch (job.name) {
			case "newComicFile":
				await processNewComicFile(job);
				break;
			case "processComicSeries":
				await processComicSeries(job);
				break;
			default:
				queueLogger.warn(`Unknown job type: ${job.name}`);
		}
	},
	{ connection: redisConnection }
);

comicFileWorker.on("completed", (job) => {
	queueLogger.info(`Worker Job ${job.id} has completed`);
});

comicFileWorker.on("failed", (job, err) => {
	queueLogger.error(`Worker Job ${job?.id} has failed with error: ${err.message}`);
});

comicFileWorker.on("error", (err) => {
	queueLogger.error(`Worker error: ${err.message}`);
});