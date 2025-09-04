import { Hono, Context } from "hono";
import { comicLibraryController } from "../controllers/comicLibraries.controller.ts";

const app = new Hono();

app.post("/create-library", (c: Context) => comicLibraryController.registerLibrary(c));

export default app;
