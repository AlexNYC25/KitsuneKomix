import app from "./api/app.ts";
import { getWatcherManager } from "./file-watching/index.ts";
import "./queue/workers/comicBook.worker.ts";
import "./queue/workers/series.worker.ts";
import "./queue/workers/file.worker.ts";

import { runMigrations } from "#db/migrate.ts";

import { API_PORT } from "#utilities/environment.ts";

await runMigrations();

const _watchManager = getWatcherManager();

const port = parseInt(API_PORT, 10);

Deno.serve({ port: port }, app.fetch);
