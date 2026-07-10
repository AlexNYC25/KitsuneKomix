import { getClient, getQueueClient, runMigrations } from "kitsune-komix-database";

const server = Bun.serve({
  port: 8001,
  routes: {
    "/": () => new Response('Bun!'),
  }
});

const honkerDb = await getQueueClient();

await runMigrations()

const dbClient = await getClient();

console.log(`Listening on ${server.url}`);