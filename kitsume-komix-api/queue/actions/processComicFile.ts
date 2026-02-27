import { dirname } from "@std/path";

import { standardizeMetadata, combineMetadataWithParsedFileDetails } from "#utilities/metadata.ts";
import { getComicFileRawDetails } from "#utilities/comic-parser.ts";
import { queueLogger } from "../../logger/loggers.ts";

import {
	getComicBookByFilePath,
	insertComicBook,
  updateComicBook,
} from "#sqlite/models/comicBooks.model.ts";
import {
	addComicBookToSeries
} from "#sqlite/models/comicSeries.model.ts";
import { getLibraryContainingPath } from "#sqlite/models/comicLibraries.model.ts";

import { calculateFileHash } from "#utilities/hash.ts";

import type { 
	ComicBook, 
	WorkerFileCheckResult,
	ComicFileDetails,
  NewComicBook,
  WorkerDataForBuildingComicInsertion,
	WorkerComicFileMetadataResult,
  ComicSeries
} from "#types/index.ts";
import { StandardizedComicMetadata } from "#interfaces/index.ts";
import { queue } from "sharp";

/**
 * Determines whether a file should be processed by comparing its current hash to the stored hash.
 * @param filePath File path to check.
 * @returns Object containing `shouldBeProcessed` and the current file `hash`.
 */
export const checkIfTheFileShouldBeProcessed = async (
	filePath: string
): Promise<WorkerFileCheckResult> => {
	const dbRecord: ComicBook | null = await getComicBookByFilePath(filePath);
	const fileHash: string = await calculateFileHash(filePath);

	// The comic book file is new
	if (!dbRecord) {
		// If the record doesn't exist, we consider it as updated (or new)
		return { shouldBeProcessed: true, hash: fileHash};
	}

	// The comic book file exists, check if the hash has changed
	const shouldBeProcessed: boolean = fileHash !== dbRecord.hash;

	// If the file exists in records but the hash has changed, we need to process it
	return { shouldBeProcessed, hash: fileHash, dbRecord };
};

/**
 * Begins the process of preparing comic file metadata for insertion by combining standardized metadata with parsed file details.
 * @param workerData Data from the worker for building the comic insertion.
 * @returns An object containing the combined comic insertion data and standardized metadata.
 */
export const prepareComicFilesMetadataForProcessing = async (
	workerData: WorkerDataForBuildingComicInsertion
): Promise<WorkerComicFileMetadataResult> => {
	const rawFileDetails: ComicFileDetails = getComicFileRawDetails(workerData.filePath);

	const standardizedMetadata: StandardizedComicMetadata | undefined =
      await standardizeMetadata(workerData.filePath);

	const combinedData: NewComicBook = await combineMetadataWithParsedFileDetails(
		workerData,
		rawFileDetails,
		standardizedMetadata,
	);

	const resultData: WorkerComicFileMetadataResult = {
		comicData: combinedData,
		standardizedMetadata: standardizedMetadata,
	};

	return resultData;
}

/**
 * Handles the logic for either updating an existing comic book record or inserting a new one based on the provided metadata and file check results.
 * @param shouldProcessFile The result of the initial checks over the comic file against the db
 * @param comicData The generated data insertion object for adding a new/updated comic book data
 * @returns The ID of the comic book that was updated or inserted
 */
export const processTheUpdateOrInsertionOfComicBook = async (
	shouldProcessFile: WorkerFileCheckResult,
	comicData: NewComicBook
) => {
	let comicId: number;

	if (shouldProcessFile.dbRecord) {
		// Update existing record
		await updateComicBook(shouldProcessFile.dbRecord.id, comicData);
		comicId = shouldProcessFile.dbRecord.id;
	} else {
		// Insert new record
		const newRecord: NewComicBook = comicData;
		comicId = await insertComicBook(newRecord);
	}

	return comicId;
}

export const processTheLinkingOfComicBookToSeries = async (
	comicId: number,
	seriesId: number
) => {
	try {
		const linked: boolean = await addComicBookToSeries(seriesId, comicId);

		if (linked) {
			queueLogger.info(`Successfully linked comic book ID ${comicId} to series ID ${seriesId}`);
			return;
		}

		queueLogger.error(`Comic book ID ${comicId} is already linked to series ID ${seriesId} or there was an issue linking them.`);
	} catch (error) {
		throw new Error(error instanceof Error ? error.message : String(error));
	}
};