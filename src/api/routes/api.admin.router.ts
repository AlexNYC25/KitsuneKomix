import { Context, Hono } from "hono";

import { purgeAllData } from "../db/sqlite/models/admin.model.ts";

const app = new Hono();

app.post("/purge-data", (_c: Context) => {
  return purgeAllData();
});

export default app;
