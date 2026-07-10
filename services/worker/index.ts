import { IngestionWorker } from "./workers/ingestionWorker";

const ingestionWorker = new IngestionWorker();

await ingestionWorker.start()