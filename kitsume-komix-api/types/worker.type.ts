import { ComicBook } from "./database.types.ts";

export type WorkerJob = {
  data: {
    filePath: string;
    metadata: object;
  };
};

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