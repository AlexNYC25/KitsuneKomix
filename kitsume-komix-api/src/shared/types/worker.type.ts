import { StandardizedComicMetadata } from "#interfaces/index.ts";
import { ComicBook, NewComicBook } from "./database.types.ts";

/**
 * Type representing the job data for jobs realted to processing comic files
 * - `filePath`: The path to the comic file that needs to be processed.
 */
export type WorkerFileJob = {
  filePath: string;
}

/**
 * Type representing the job data for jobs related to linking comic series to libraries.
 * - `seriesId`: The ID of the comic series that needs to be linked.
 * - `folderPath`: The folder path of the comic library that the series should be linked to.
 */
export type WorkerLibrarySeriesJob = {
  seriesId: number;
  folderPath: string;
}

/**
 * Result type for checking if a file should be processed by the worker.
 * - `shouldBeProcessed`: Indicates if the file needs processing.
 * - `dbRecord`: Optional existing comic book record from the database (if found).
 * - `hash`: Optional current hash of the file for comparison.
 */
export type WorkerFileCheckResult = {
  shouldBeProcessed: boolean;
  dbRecord?: ComicBook;
  hash: string;
};

/**
 * Data used for building a new comic book insertion as part
 * of the worker's processing workflow.
 */
export type WorkerDataForBuildingComicInsertion = {
  filePath: string;
  fileHash: string;
}

/**
 * Result type for preparing comic file metadata for processing.
 * - `comicData`: The combined comic data ready for insertion.
 * - `standardizedMetadata`: Optional standardized metadata extracted from the file.
 */
export type WorkerComicFileMetadataResult = {
  comicData: NewComicBook;
  standardizedMetadata?: StandardizedComicMetadata;
};