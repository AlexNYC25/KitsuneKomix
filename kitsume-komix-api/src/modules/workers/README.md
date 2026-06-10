# Comic Ingestion Worker System

SQLite-based worker system for processing comic book files through a multi-stage ingestion pipeline.

## Architecture

```
┌─────────────┐
│  Watcher    │ (Chokidar - watches filesystem)
└──────┬──────┘
       │ inserts into
       ▼
┌─────────────────────────┐
│ comic_book_ingestion    │ (SQLite table)
│ - id                    │
│ - comicBookId           │
│ - state (pipeline stage)│
│ - metadata (JSON)       │
│ - errorMessage          │
└──────┬──────────────────┘
       │ polled by
       ▼
┌────────────────────┐
│  Worker Manager    │ (Polls for pending jobs)
└────────┬───────────┘
         │ dispatches to
         ▼
┌─────────────────┐
│  Worker         │ (Routes to appropriate handler)
└────────┬────────┘
         │ executes
         ▼
┌────────────────────┐
│  Job Handlers      │ (One per pipeline stage)
│ - FileDetected     │
│ - MetadataExtract  │
│ - CreateCandidates │
│ - ResolveEntities  │
│ - BuildLinks       │
│ - Complete         │
└────────────────────┘
```

## Pipeline Stages

Each comic file moves through these states:

1. **FILE_DETECTED** → Verify file, calculate hash, create/find comic record
2. **METADATA_EXTRACTION** → Extract embedded metadata (ComicInfo.xml, CoMet.xml)
3. **METADATA_CANDIDATES_CREATED** → Create candidate records for metadata values
4. **METADATA_ENTITIES_RESOLVED** → Find or create entities (writers, publishers, etc.)
5. **COMIC_LINKS_BUILT** → Link comic to entities, finalize metadata
6. **COMIC_INGESTION_COMPLETED** → Job complete

If errors occur, state moves to **FAILED** with error message.

## Key Components

### Worker Manager (`worker-manager.ts`)
- Polls `comic_book_ingestion` table for pending jobs
- Dispatches jobs to workers
- Configurable poll interval, batch size, concurrency
- Handles graceful shutdown

### Ingestion Worker (`ingestion-worker.ts`)
- Routes jobs to appropriate handler based on state
- Handles errors and updates job state
- Can process jobs sequentially or in batches

### Job Handlers (`handlers/`)
Each handler implements the `JobHandler` interface:
- `handle(record)` - Process the job
- Returns `JobHandlerResult` with success/failure

### Ingestion Queue Service (`ingestion-queue.service.ts`)
- Used by file watcher to enqueue files
- Checks for duplicates before enqueueing
- Provides queue size information

## Usage

### Starting the Worker

The worker is started automatically when running `worker.ts`:

```bash
deno task start:worker
# or
deno run worker.ts
```

### Enqueuing Files (from Watcher)

```typescript
import { IngestionQueueService } from "#modules/workers/index.ts";

// Enqueue a single file
const recordId = await IngestionQueueService.enqueueFile("/path/to/comic.cbz");

// Enqueue multiple files
const recordIds = await IngestionQueueService.enqueueFiles([
  "/path/to/comic1.cbz",
  "/path/to/comic2.cbz",
]);

// Check queue size
const queueSize = await IngestionQueueService.getQueueSize();
```

### Manual Job Processing (Debugging)

```typescript
import { processJobById } from "#modules/workers/index.ts";

// Process a specific ingestion record
await processJobById(123);
```

## Configuration

Configure the worker manager in `worker.ts`:

```typescript
const workerManager = new WorkerManager({
  pollInterval: 5000,  // Poll every 5 seconds
  batchSize: 10,       // Fetch up to 10 jobs per poll
  concurrency: 1,      // Process sequentially (increase for parallel)
});
```

## Database Tables

### `comic_book_ingestion`
Tracks ingestion progress for each file.

- `id` - Primary key
- `comicBookId` - FK to comic_books (0 if not yet created)
- `state` - Current pipeline stage
- `metadata` - JSON blob with contextual data
- `errorMessage` - Error details if failed
- `createdAt`, `updatedAt` - Timestamps

### `comic_metadata_candidates`
Stores extracted metadata values before entity resolution.

- `id` - Primary key
- `comicBookId` - FK to comic_books
- `type` - Metadata type (writer, publisher, etc.)
- `value` - Raw value
- `normalizedValue` - Normalized for matching
- `status` - pending/accepted/rejected
- `resolvedId` - ID of resolved entity (if accepted)

## Development Notes

### Adding New Pipeline Stages

1. Add new state to `IngestionState` type in `comicBookIngestion.model.ts`
2. Create new handler implementing `JobHandler` interface
3. Register handler in `IngestionWorker` constructor
4. Update previous handler to transition to new state

### Adding Entity Resolution Logic

Entity resolution handlers (stage 4) are currently placeholders. To implement:

1. Import entity models (writers, publishers, etc.)
2. For each candidate type, check if entity exists by normalized value
3. If exists, get ID; if not, create new entity
4. Update candidate with `resolvedId`

### Testing

```typescript
// Test a specific handler
const handler = new FileDetectedHandler();
const result = await handler.handle(record);

// Test the entire worker
const worker = new IngestionWorker();
const result = await worker.processJob(record);
```

## Migration from BullMQ

This system replaces the previous Redis + BullMQ implementation:

**Old:** `kitsume-komix-api/src/infrastructure/queue/`  
**New:** `kitsume-komix-api/src/modules/workers/`

The old implementation is kept for reference but not imported.

## Troubleshooting

### Jobs stuck in a state

Check the `errorMessage` field in the `comic_book_ingestion` table.

### Worker not processing jobs

1. Check worker is running: `docker-compose ps`
2. Check logs: `docker-compose logs worker`
3. Verify jobs exist: `SELECT * FROM comic_book_ingestion WHERE state != 'COMIC_INGESTION_COMPLETED'`

### Failed jobs

Failed jobs must be manually retried by updating their state:

```sql
UPDATE comic_book_ingestion 
SET state = 'FILE_DETECTED', errorMessage = NULL 
WHERE id = ?
```
