import { initLogger } from "#logger/loggers.ts";

import { runMigrations } from "#infrastructure/db/scripts/migrate.ts";
import { setUpAppSettings } from "#infrastructure/db/scripts/seed.ts";

// Import the new SQLite-based ingestion worker

// NOTE: Old BullMQ/Redis workers are kept for reference but not imported
// import "#infrastructure/queue/workers/comicBook.worker.ts";
// import "#infrastructure/queue/workers/series.worker.ts";
// import "#infrastructure/queue/workers/file.worker.ts";

await initLogger();
await runMigrations();
await setUpAppSettings();

// Start the new SQLite-based ingestion worker

// The worker manager's polling loop will keep the process alive
// Signal handlers are already set up in worker.ts module
