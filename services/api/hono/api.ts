import { factory, finalMiddlewareApply } from "./factory"

import authRouter from "../modules/auth/auth.routes";

const app = factory(true);

app.route("/auth", authRouter);

app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

finalMiddlewareApply(app);

export default app;