import app from "#app/api.ts";
import { startWatcher } from "#app/watcher.ts";

import { env } from "#config/env.ts";

import { runMigrations } from "#infrastructure/db/scripts/migrate.ts";
import { setUpAppSettings } from "#infrastructure/db/scripts/seed.ts";

import "#infrastructure/queue/workers/comicBook.worker.ts";
import "#infrastructure/queue/workers/series.worker.ts";
import "#infrastructure/queue/workers/file.worker.ts";

await runMigrations();
await setUpAppSettings();
await startWatcher();

Deno.serve({ port: env.PORT }, app.fetch);
