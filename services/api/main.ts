import { getClient } from "kitsune-komix-database";
const server = Bun.serve({
  port: 8001,
  routes: {
    "/": () => new Response('Bun!'),
  }
});

const dbClient = await getClient();

console.log(`Listening on ${server.url}`);