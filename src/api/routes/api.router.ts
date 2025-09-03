import { Hono } from "hono";
import apiUsersRouter from "./api.users.router.ts";

const apiRouter = new Hono();

apiRouter.route("/users", apiUsersRouter);

export default apiRouter;