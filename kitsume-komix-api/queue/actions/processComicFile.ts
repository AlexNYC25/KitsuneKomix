
import {
	getComicBookByFilePath
} from "#sqlite/models/comicBooks.model.ts";

import { calculateFileHash } from "#utilities/hash.ts";

import type { ComicBook } from "#types/index.ts";

/**
 * Check if a comic book file exists in the database records based on its file path.
 * @param filePath The path to the comic book file
 * @returns boolean determining if we have a record of a comic book file at the given path
 */
export const checkIfFileExistsInRecords = async (
  filePath: string,
): Promise<ComicBook | null> => {
	const dbRecord: ComicBook | null = await getComicBookByFilePath(filePath);

  return dbRecord;
};

/**
 * Checks if the comic book file has been updated by comparing its current hash with the hash stored in the database.
 * @param filePath The path to the comic book file
 * @returns boolean determining if the file has been updated (true if updated, false if not)
 */
export const checkIfTheFileHasBeenUpdated = async (
	filePath: string,
	comicBookRecord?: ComicBook | null,
): Promise<boolean> => {
	const dbRecord: ComicBook | null =
		comicBookRecord ?? (await getComicBookByFilePath(filePath));

	if (!dbRecord) {
		// If the record doesn't exist, we consider it as updated (or new)
		return true;
	}

	const currentComicBookHash: string = dbRecord.hash;

	const fileHash: string = await calculateFileHash(filePath);

	return fileHash !== currentComicBookHash;
};

/**
 * Check if the comic book file should be processed by determining if it exists in the database and if it has been updated since the last record.
 * @param filePath The path to the comic book file
 * @returns boolean determining if the file should be processed (true if it should be processed, false if not)
 */
export const checkIfTheFileShouldBeProcessed = async (
	filePath: string,
): Promise<boolean> => {
		const dbRecord: ComicBook | null = await getComicBookByFilePath(filePath);

		if (!dbRecord) {
			return true;
		}

		return await checkIfTheFileHasBeenUpdated(filePath, dbRecord);
};