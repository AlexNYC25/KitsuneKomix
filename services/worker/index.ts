import { IngestionWorker } from "./workers/ingestion/ingestion.worker";
import { ComicBookRecordWorker } from "./workers/ingestion/comicBookRecord.worker";
import { ComicBookSeriesMappingWorker } from "./workers/ingestion/comicBookSeriesMapping.worker";
import { MetadataAggregationWorker } from "./workers/metadata/metadataAggregation.worker";
import { MetadataWorker } from "./workers/metadata/metadataExtraction.worker";
import { MetadataInsertionWorker } from "./workers/metadata/metadataInsertion.worker";
import { ComicPagesWorker } from "./workers/pages/comicPages.worker";
import { ComicThumbnailsWorker } from "./workers/pages/comicThumbnails.worker";

const ingestionWorker = new IngestionWorker();
const comicBookRecordWorker = new ComicBookRecordWorker();
const comicBookSeriesMappingWorker = new ComicBookSeriesMappingWorker();
const metadataAggregationWorker = new MetadataAggregationWorker();
const metadataWorker = new MetadataWorker();
const metadataInsertionWorker = new MetadataInsertionWorker();
const comicPagesWorker = new ComicPagesWorker();
const comicThumbnailsWorker = new ComicThumbnailsWorker();

await Promise.all([
  ingestionWorker.start(),
  comicBookRecordWorker.start(),
  comicBookSeriesMappingWorker.start(),
  metadataAggregationWorker.start(),
  metadataWorker.start(),
  metadataInsertionWorker.start(),
  comicPagesWorker.start(),
  comicThumbnailsWorker.start(),
]);
