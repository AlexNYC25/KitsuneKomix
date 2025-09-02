import { Hono } from "hono";
import rootRouter from "./routes/root.router.ts";

const app = new Hono();

app.route("/", rootRouter);

app.notFound((c) => {
  return c.json({ error: "Not Found" }, 404);
});

app.onError((err, c) => {
  console.error("Unhandled error:", err);
  return c.json({ error: "Internal Server Error" }, 500);
});

export default app;
