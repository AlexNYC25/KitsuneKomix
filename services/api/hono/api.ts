import { auth } from "../utils/auth";

import { factory, finalMiddlewareApply } from "./factory";

import processingRouter from "../modules/processing/processing.router";



const app = factory(true);

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.get("/health", (c) => {
	return c.json({ status: "ok" });
});

app.route("/api/processing", processingRouter);

finalMiddlewareApply(app);

export default app;
