import { Hono } from "hono";
import apiUsersRouter from "./api.users.router.ts";
import comicLibraryRouter from "./api.comiclibraries.router.ts";
import adminRouter from "./api.admin.router.ts";
import comicBookRouter from "./api.comicbooks.router.ts";

const apiRouter = new Hono();

apiRouter.route("/users", apiUsersRouter);
apiRouter.route("/comic-libraries", comicLibraryRouter);
apiRouter.route("/comic-books", comicBookRouter);
apiRouter.route("/admin", adminRouter);

export default apiRouter;
