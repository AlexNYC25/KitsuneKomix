import { Worker } from "bullmq";
import { dirname } from "path";

import { queueLogger } from "../../logger/loggers.ts";

import { getLibraryContainingPath } from "#sqlite/models/comicLibraries.model.ts";
import { 
	getComicSeriesByPath, 
	insertComicSeries,
	insertComicSeriesIntoLibrary
} from "#sqlite/models/comicSeries.model.ts";

import {
	WorkerJob,
	ComicSeries,
  NewComicSeries
} from "#types/index.ts";
import { StandardizedComicMetadata } from "#interfaces/index.ts";
import { seriesQueue, comicBookQueue } from "../index.ts";
import { retrieveMetadataFromCache } from "#utilities/metadata.ts";


/**
 * The wrapper function to add a job to the comicBookQueue for saving a comic book with its series link.
 * 
 * @param seriesId The ID of the comic series
 * @param filePath The file path of the comic book
 */
const setUpJobToLinkComicToSeries = async (
	seriesId: number, 
	filePath: string
) => {
	await comicBookQueue.add("save-comic-book", {
		seriesId,
		filePath,
	});
};

/**
 * Handles linking a comic series to its parent library in the database.
 * @param job Job data containing seriesId and folderPath
 */
export const processComicLibraryLinkingToSeries = async (
	job: { seriesId: number; folderPath: string }
) => {
	const { seriesId, folderPath } = job;

	queueLogger.info(`Linking comic series ${seriesId} to library for path: ${folderPath}`);

	try {
		const library = await getLibraryContainingPath(folderPath);

		if (!library) {
			throw new Error(
				`Could not determine library ID for folder path: ${folderPath}`,
			);
		}

		await insertComicSeriesIntoLibrary(seriesId, library.id);
		queueLogger.info(`Successfully linked series ${seriesId} to library ${library.id}`);
	} catch (error) {
		queueLogger.error(
			`Error linking series ${seriesId} to library: ${error}`,
		);
		throw error;
	}
};

/**
 * The function that handles the logic of adding a new comic series to the database 
 * when a new comic book file is added and its parent directory doesn't match any existing series.
 * 
 * @param job The job object containing the data for the new comic book file that needs a new series created for it
 */
export const processAddingANewComicSeries = async (job: { filePath: string }) => {

	const parentPath = dirname(job.filePath);

	const seriesName = parentPath.split("/").pop();
	if (!seriesName) {
		throw new Error(
			`Could not extract series name from path: ${parentPath}`,
		);
	}

	// we need the metadata for the comic book file to get the series name in the case that we have
	// it and use it instead of the parent folder name, we can retrieve the metadata from the redis cache where the file worker should have stored it after extracting it from the comic book file
	const comicMetadata: StandardizedComicMetadata | null = await retrieveMetadataFromCache(job.filePath);

	try {
		const seriesData: NewComicSeries = {
			name: comicMetadata?.series || seriesName,
			description: null,
			folderPath: parentPath,
		};

		const seriesId = await insertComicSeries(seriesData);
		queueLogger.info(
			`Inserted new comic series with ID: ${seriesId} for path: ${parentPath}`,
		);
		
		// we also want to link the comic series to the library it belongs to, 
		// we can do this by finding the library that contains the comic series folder path and then updating the comic series record with the library ID
		seriesQueue.add("add-series-to-library", {
			seriesId,
			folderPath: parentPath,
		});

		// After inserting the new series, we can enqueue a job to process the comic book with the new series ID
		await setUpJobToLinkComicToSeries(seriesId, job.filePath);

	} catch (error) {
		queueLogger.error(
			`Error inserting new comic series for path: ${parentPath}: ${error}`,
		);
	}

}


/**
 * Checks if the parent directory of the new comic book file 
 * corresponds to an existing comic series in the database.
 * 
 * Depending on whether a series is found, it either enqueues a job to process 
 * the comic book with the existing series ID or enqueues a job to create a new comic series.
 * 
 * @param job The data object with the filepath of the new file
 * @returns 
 */
const processComicSeries = async (job: { filePath: string }) => {
	const filePath: string = job.filePath;

	queueLogger.info(`Starting comic series processing for file: ${filePath}`);

	const parentPath = dirname(filePath);
  let existingSeries: ComicSeries | null = null;

  try {
    existingSeries = await getComicSeriesByPath(parentPath);
    queueLogger.info(`Checking for comic series at path: ${parentPath}`);
  } catch (error) { 
    queueLogger.error(
      `Error checking for existing comic series at path: ${parentPath}: ${error}`,
    );
    
    return; // Exit the function if there's an error checking for existing series
  }

	// if the comic series already exists then we add the comic book job to thw comicBookQueue with the seriesId of the existing series
	// we will need to pass the comic series id + file path as the job data
	if (existingSeries) {
		queueLogger.info(`Existing comic series found for path: ${parentPath}, series ID: ${existingSeries.id}`);
		// add job to comicBookQueue with existingSeries.id and filePath
		await setUpJobToLinkComicToSeries(existingSeries.id, filePath);
	} else {
		queueLogger.info(`No existing comic series found for path: ${parentPath}, creating new series`);
		// add job to comicSeriesQueue to create a new series with the filePath
		seriesQueue.add("add-new-comic-series", {
			filePath,
		});
	}
};

export const seriesWorker = new Worker(
	"comicSeries",
	async (job) => {
		switch (job.name) {
			case "process-comic-series":
				await processComicSeries(job as unknown as { filePath: string });
				break;
			case "add-new-comic-series":
				await processAddingANewComicSeries(job as unknown as { filePath: string });
				break;
			case "add-series-to-library":
				await processComicLibraryLinkingToSeries(job as unknown as { seriesId: number; folderPath: string });
				break;
			default:
				queueLogger.warn(`No processor defined for job name: ${job.name}`);
		}
	}
)