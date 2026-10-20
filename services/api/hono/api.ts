import type { OpenAPIHono } from "@hono/zod-openapi";

import processingRouter from "../modules/processing/processing.router";
import usersRouter from "../modules/users/users.router";

import type { ApiEnv } from "../types/Auth.types";

import { auth } from "../utils/auth";

import { factory, finalMiddlewareApply } from "./factory";

// The root openapi hono instance with all the necessary middleware applied.
const app: OpenAPIHono<ApiEnv> = factory(true);

// We pass the authentication behavior to the better-auth handler, which will handle the authentication for us.
app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.get("/health", (c) => {
	return c.json({ status: "ok" });
});

app.route("/api/processing", processingRouter);
app.route("/api/users", usersRouter);

finalMiddlewareApply(app);

export default app;
