import app from "./api/app.ts";
import { initializeDatabase } from "./config/db/sqliteSetUp.ts";
import { getWatcherManager } from "./config/fileWatchers/watcherManager.ts";
import "./queue/workers/comicWorker.ts";

initializeDatabase();

const _watchManager = getWatcherManager();

const port = parseInt(Deno.env.get("PORT") ?? "3000", 10);

Deno.serve({ port: port }, app.fetch);
