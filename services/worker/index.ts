import { IngestionWorker } from "./workers/ingestion.worker";

const ingestionWorker = new IngestionWorker();

await ingestionWorker.start()