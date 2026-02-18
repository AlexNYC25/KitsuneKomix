import { OpenAPIHono } from "@hono/zod-openapi";
import apiUsersRouter from "./api.users.router.ts";
import comicLibraryRouter from "./api.comiclibraries.router.ts";
import adminRouter from "./api.admin.router.ts";
import comicBookRouter from "./api.comicbooks.router.ts";
import authRouter from "./api.auth.router.ts";
import comicSeriesRouter from "./api.comicseries.router.ts";
import comicPagesRouter from "./api.comicpages.router.ts";
import collectionsRouter from "./api.collections.router.ts";
import readlistsRouter from "./api.readlists.router.ts";
import imageRouter from "./image.router.ts";

import { swaggerUI } from "@hono/swagger-ui";

const apiRouter = new OpenAPIHono();

// OpenAPI documentation endpoint
apiRouter.doc("/doc", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "KitsuneKomix API",
    description:
      "API documentation for KitsuneKomix comic book management system",
  },
});

// Swagger UI for API documentation
apiRouter.get(
  "/ui",
  swaggerUI({
    url: "/api/doc",
  }),
);

// Sub-routers for separate API functionalities
apiRouter.route("/users", apiUsersRouter);
apiRouter.route("/comic-libraries", comicLibraryRouter);
apiRouter.route("/auth", authRouter);
apiRouter.route("/comic-books", comicBookRouter);
apiRouter.route("/admin", adminRouter);
apiRouter.route("/comic-series", comicSeriesRouter);
apiRouter.route("/comic-pages", comicPagesRouter);
apiRouter.route("/collections", collectionsRouter);
apiRouter.route("/readlists", readlistsRouter);
apiRouter.route("/image", imageRouter);

export default apiRouter;
