
export type INITIAL_FILE_DETECTED = "FILE_DETECTED";
export type INITIAL_COMIC_DISCOVERED = "COMIC_DISCOVERED";
export type METADATA_EXTRACTION = "METADATA_EXTRACTION";
export type METADATA_CANDIDATES_CREATED = "METADATA_CANDIDATES_CREATED";
export type METADATA_ENTITIES_RESOLVED = "METADATA_ENTITIES_RESOLVED";
export type COMIC_LINKS_BUILT = "COMIC_LINKS_BUILT";
export type COMIC_INGESTION_COMPLETED = "COMIC_INGESTION_COMPLETED";

export type QueueTaskType =
  | INITIAL_FILE_DETECTED
  | INITIAL_COMIC_DISCOVERED
  | METADATA_EXTRACTION
  | METADATA_CANDIDATES_CREATED
  | METADATA_ENTITIES_RESOLVED
  | COMIC_LINKS_BUILT
  | COMIC_INGESTION_COMPLETED;

export type QueueTask = {
  id: string;
  type: QueueTaskType;
  payload: unknown; // Can be more specific based on the task type
  createdAt: Date;
};

export type QueueInitialFileDetectedPayload = {
  filePath: string;
};

export type QueueInitialComicDiscoveredPayload = {
  comicBookId: number;
};

export type QueueMetadataExtractionPayload = {
  comicBookId: number;
};

export type QueueMetadataCandidatesCreatedPayload = {
  comicBookId: number;
};

export type QueueMetadataEntitiesResolvedPayload = {
  comicBookId: number;
};

export type QueueComicLinksBuiltPayload = {
  comicBookId: number;
};

export type QueueComicIngestionCompletedPayload = {
  comicBookId: number;
};