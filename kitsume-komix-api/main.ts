import app from "./api/app.ts";
import { getWatcherManager } from "./fileWatchers/watcherManager.ts";
import "./queue/workers/comicWorker.ts";

import { runMigrations } from "./db/migrate.ts";

await runMigrations();

const _watchManager = getWatcherManager();

const port = parseInt(Deno.env.get("PORT") ?? "3000", 10);

Deno.serve({ port: port }, app.fetch);
