import { factory, finalMiddlewareApply } from "./factory"

const app = factory(true);

app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

finalMiddlewareApply(app);

export default app;