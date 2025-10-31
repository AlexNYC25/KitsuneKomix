import app from "./api/app.ts";
import { getWatcherManager } from "./fileWatchers/watcherManager.ts";
import "./queue/workers/comicWorker.ts";

import { runMigrations } from "./db/migrate.ts";

import { API_PORT } from "./config/enviorement.ts";

await runMigrations();

const _watchManager = getWatcherManager();

const port = parseInt(API_PORT, 10);

Deno.serve({ port: port }, app.fetch);
