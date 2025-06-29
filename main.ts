import { Application, Router, Context, Status } from "@oak/oak";

import { setUpDatabase } from "./src/database/setup.ts";
import { startBackgroundComicsParser } from "./src/tasks/background.ts";

const app = new Application();
const router = new Router();

// Set up the database
setUpDatabase();
// Start the background task
startBackgroundComicsParser();

const port = parseInt(Deno.env.get("PORT") ?? "3000", 10);

router.get("/", (ctx: Context) => {
  ctx.response.body = "Hello, world!";
});

// 404 handler (for routes not matched)
app.use(router.routes());
app.use(router.allowedMethods());
app.use((ctx) => {
  ctx.response.status = Status.NotFound;
  ctx.response.body = { message: "Not Found" };
});

// Global error handler
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.error(err);
    ctx.response.status = Status.InternalServerError;
    ctx.response.body = { message: "Internal Server Error" };
  }
});

app.addEventListener("listen", () => {
  console.log(`Server is running on http://localhost:${port}`);
});

await app.listen({ port });