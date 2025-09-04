import { Hono } from "hono";
import rootRouter from "./routes/root.router.ts";
import apiRouter from "./routes/api.router.ts";

import { apiLogger } from "../config/logger/loggers.ts";

const app = new Hono();

app.route("/", rootRouter);
app.route("/api", apiRouter);

app.notFound((c) => {
  return c.json({ error: "Not Found" }, 404);
});

app.onError((err, c) => {
  apiLogger.error("Unhandled error: " + err.message);
  return c.json({ error: "Internal Server Error" }, 500);
});

export default app;
