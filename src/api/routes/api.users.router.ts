import { Context, Hono } from "hono";
import { userController } from "../controllers/users.controller.ts";

const apiUsersRouter = new Hono();

apiUsersRouter.post("/create-user", (c: Context) => {
  return userController.createUser(c);
});

export default apiUsersRouter;
