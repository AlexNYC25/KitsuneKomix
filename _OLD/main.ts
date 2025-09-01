import app from "../src/api/app.ts";

import { setUpDatabase } from "../src/database/setup.ts";
import { startBackgroundComicsParser } from "../src/tasks/background.ts";

// Set up the database
setUpDatabase();
// Start the background task
startBackgroundComicsParser();

const port = parseInt(Deno.env.get("PORT") ?? "3000", 10);

app.addEventListener("listen", () => {
  console.log(`Server is running on http://localhost:${port}`);
});

await app.listen({ port });