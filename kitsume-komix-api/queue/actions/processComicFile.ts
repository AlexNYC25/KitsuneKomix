
import {
	getComicBookByFilePath
} from "#sqlite/models/comicBooks.model.ts";

import { calculateFileHash } from "#utilities/hash.ts";

import type { ComicBook, WorkerFileCheckResult } from "#types/index.ts";

/**
 * Fetches the comic book record for a given file path.
 * @param filePath File path to look up.
 * @returns Comic book record if found; otherwise null.
 */
export const checkIfFileExistsInRecords = async (
  filePath: string,
): Promise<ComicBook | null> => {
	const dbRecord: ComicBook | null = await getComicBookByFilePath(filePath);

  return dbRecord;
};

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
