import { Application, Router, Context, Status } from "@oak/oak";

import purgeRouter from "./routes/admin/purge.ts";

const app = new Application();
const router = new Router();

router.get("/", (ctx: Context) => {
  ctx.response.body = "Hello, world!";
});

// 404 handler (for routes not matched)
app.use(router.routes());
app.use(router.allowedMethods());

// Importing routes
app.use(purgeRouter.routes());
app.use(purgeRouter.allowedMethods());

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

export default app;