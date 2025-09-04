import { Hono, Context } from "hono";
import { adminController } from "../controllers/admin.controller.ts";

const app = new Hono();

app.post("/purge-data", (c: Context) => adminController.purgeAllData(c));

export default app;
