import { StandardizedComicMetadata, ComicBookIngestion } from "#types/index.ts";
import { ComicBook, NewComicBook } from "./database.types.ts";


/**
 * Type representing the job data for jobs realted to processing comic files
 * - `filePath`: The path to the comic file that needs to be processed.
 */
export type WorkerFileJob = {
  filePath: string;
}

/**
 * Type representing the job data for jobs related to processing comic book images.
 * - `comicId`: The ID of the comic book for which images need to be processed.
 * - `filePath`: The path to the comic file that contains the images to be processed.
 */
export type WorkerComicFileJob = {
  comicId: number;
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
 * Type representing the job data for jobs related to processing new comic book insertions.
 * - `filePath`: The path to the comic file that needs to be processed.
 * - `seriesId`: The ID of the comic series that the new comic book belongs to.
 */
export type WorkerFilePathSeriesJob = {
  filePath: string;
  seriesId: number;
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


/**
 * Configuration for the Worker Manager
 */
export type WorkerManagerConfig = {
  /** How often to poll for new jobs (milliseconds) */
  pollInterval?: number;
  /** Maximum number of jobs to fetch per poll */
  batchSize?: number;
  /** Number of worker instances to use for parallel processing */
  concurrency?: number;
};


/**
 * Result of a job handler execution
 */
export type JobHandlerResult = {
  success: boolean;
  errorMessage?: string;
  data?: Record<string, unknown>;
};

/**
 * Base interface for all job handlers
 */
export interface JobHandler {
  /**
   * Execute the handler logic
   * @param record The ingestion record to process
   * @returns A result indicating success or failure
   */
  handle(record: ComicBookIngestion): Promise<JobHandlerResult>;
}

export type IngestionState =
  | "FILE_DETECTED"
  | "METADATA_EXTRACTION"
  | "METADATA_CANDIDATES_CREATED"
  | "METADATA_ENTITIES_RESOLVED"
  | "COMIC_LINKS_BUILT"
  | "COMIC_INGESTION_COMPLETED"
  | "FAILED";

export type ComicBookIngestionRecord = {
  id: number;
  comicBookId: number;
  metadata: string | null;
  state: IngestionState | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MetadataCandidateType =
  | "title"
  | "series"
  | "genre"
  | "publisher"
  | "imprint"
  | "writer"
  | "penciler"
  | "inker"
  | "colorist"
  | "letterer"
  | "cover_artist"
  | "editor"
  | "character"
  | "team"
  | "location"
  | "story_arc"
  | "series_group";

export type MetadataCandidateStatus = "pending" | "accepted" | "rejected";