import app from "#app/api.ts";
import { startWatcher } from "#app/watcher.ts";

import { env } from "#config/env.ts";
import { initLogger } from "#logger/loggers.ts";

import { runMigrations } from "#database/scripts/migrate.ts";
import { generateDbml } from "#database/scripts/dbml.ts";
import { setUpAppSettings } from "#database/scripts/seed.ts";

await initLogger();
await runMigrations();
generateDbml();
await setUpAppSettings();
await startWatcher();

Deno.serve({ port: env.PORT }, app.fetch);
