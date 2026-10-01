import { factory, finalMiddlewareApply } from "./factory"

import { auth } from "../utils/auth";

const app = factory(true);

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

finalMiddlewareApply(app);

export default app;