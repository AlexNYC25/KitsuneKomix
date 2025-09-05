import app from "./api/app.ts";
import { initializeDatabase } from "./api/config/db/sqliteSetUp.ts";
import { getWatcherManager } from "./api/config/fileWatchers/watcherManager.ts";
import "./api/queue/workers/comicWorker.ts";

initializeDatabase();

const _watchManager = getWatcherManager();

const port = parseInt(Deno.env.get("PORT") ?? "3000", 10);

Deno.serve({ port: port }, app.fetch);
