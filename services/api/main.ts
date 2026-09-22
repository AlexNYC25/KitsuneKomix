import { getClient, getQueueClient, runMigrations } from "kitsune-komix-database";

import api from "./hono/api.ts"

const server = Bun.serve({
  port: 8001,
  routes: {
    "/*": api.fetch
  }
});

const honkerDb = await getQueueClient();

await runMigrations()

const dbClient = await getClient();

console.log(`Listening on ${server.url}`);