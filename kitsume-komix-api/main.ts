import app from "#app/api.ts";
import { startWatcher } from "#app/watcher.ts";

import { env } from "#config/env.ts";
import { initLogger } from "#logger/loggers.ts";

import { runMigrations } from "#infrastructure/db/scripts/migrate.ts";
import { setUpAppSettings } from "#infrastructure/db/scripts/seed.ts";

await initLogger();
await runMigrations();
await setUpAppSettings();
await startWatcher();

Deno.serve({ port: env.PORT }, app.fetch);
