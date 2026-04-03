import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";

import authRouter from "#routes/auth/api.auth.router.ts";
import adminRouter from "#routes/admin/api.admin.router.ts";
import apiUsersRouter from "#routes/users/api.users.router.ts";
import comicLibraryRouter from "#routes/libraries/api.comiclibraries.router.ts";
import comicSeriesRouter from "#routes/series/api.comicseries.router.ts";
import collectionsRouter from "#routes/collections/api.collections.router.ts";
import comicBookRouter from "#routes/comics/api.comicbooks.router.ts";
import readlistsRouter from "#routes/readlists/api.readlists.router.ts";
import comicPagesRouter from "#routes/pages/api.comicpages.router.ts";
import imageRouter from "#routes/images/image.router.ts";

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
apiRouter.route("/auth", authRouter);
apiRouter.route("/admin", adminRouter);
apiRouter.route("/users", apiUsersRouter);
apiRouter.route("/comic-libraries", comicLibraryRouter);
apiRouter.route("/comic-series", comicSeriesRouter);
apiRouter.route("/collections", collectionsRouter);
apiRouter.route("/comic-books", comicBookRouter);
apiRouter.route("/readlists", readlistsRouter);
apiRouter.route("/comic-pages", comicPagesRouter);
apiRouter.route("/image", imageRouter);

export default apiRouter;
