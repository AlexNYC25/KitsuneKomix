import { IngestionWorker } from "./workers/ingestion/ingestion.worker";

const ingestionWorker = new IngestionWorker();

await ingestionWorker.start()