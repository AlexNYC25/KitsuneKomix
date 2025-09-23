import { Hono } from "hono";
import apiUsersRouter from "./api.users.router.ts";
import comicLibraryRouter from "./api.comiclibraries.router.ts";
import adminRouter from "./api.admin.router.ts";
import comicBookRouter from "./api.comicbooks.router.ts";
import authRouter from "./api.auth.router.ts";

const apiRouter = new Hono();

apiRouter.route("/users", apiUsersRouter);
apiRouter.route("/comic-libraries", comicLibraryRouter);
apiRouter.route("/auth", authRouter);
apiRouter.route("/comic-books", comicBookRouter);
apiRouter.route("/admin", adminRouter);

export default apiRouter;
