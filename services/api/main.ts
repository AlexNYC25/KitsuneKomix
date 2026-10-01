import {
	getClient,
	getQueueClient,
	runMigrations,
	runSeed,
} from "kitsune-komix-database";

import api from "./hono/api.ts";

const server = Bun.serve({
	port: 8001,
	routes: {
		"/*": api.fetch,
	},
});

// The honker queue extension is only bundled in the Docker image. On other
// environments the API still serves but queue-backed features are unavailable.
try {
	const honkerDb = await getQueueClient();
} catch (error: unknown) {
	console.warn("Queue client unavailable, continuing without it:", error);
}

await runMigrations();

await runSeed();

await getClient();

console.log(`Listening on ${server.url}`);
