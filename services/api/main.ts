import { getClient, runMigrations } from "kitsune-komix-database";
const server = Bun.serve({
  port: 8001,
  routes: {
    "/": () => new Response('Bun!'),
  }
});

const dbClient = await getClient();

await runMigrations()


console.log(`Listening on ${server.url}`);