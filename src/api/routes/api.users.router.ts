import { Hono, Context } from "hono";
import { userController } from "../controllers/users.controller.ts";

const apiUsersRouter = new Hono();  

apiUsersRouter.post("/create", (c: Context) => {
  return userController.createUser(c);
});

export default apiUsersRouter;
