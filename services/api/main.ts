import { env, getClient, getQueueClient, pruneExpiredAuthData, runMigrations, runSeed } from "kitsune-komix-database";

import api from "./hono/api.ts"

const server = Bun.serve({
  port: 8001,
  routes: {
    "/*": api.fetch
  }
});

// The honker queue extension is only bundled in the Docker image. On other
// environments the API still serves but queue-backed features are unavailable.
try {
  const honkerDb = await getQueueClient();
} catch (error: unknown) {
  console.warn("Queue client unavailable, continuing without it:", error);
}

await runMigrations()

await runSeed()

const dbClient = await getClient();

// Prune expired/revoked auth records on startup and then on an interval
await pruneExpiredAuthData().catch((error: unknown) => {
  console.error("Initial auth data prune failed:", error);
});

setInterval(() => {
  pruneExpiredAuthData().catch((error: unknown) => {
    console.error("Scheduled auth data prune failed:", error);
  });
}, env.AUTH_CLEANUP_INTERVAL_MS).unref();

console.log(`Listening on ${server.url}`);