import { Context, Hono } from "hono";

const rootRouter = new Hono();

rootRouter.get("/", (c: Context) => {
  return c.json({ message: "Welcome to the API" });
});

rootRouter.get("/health", (c: Context) => {
  return c.json({ status: "ok" });
});

export default rootRouter;
