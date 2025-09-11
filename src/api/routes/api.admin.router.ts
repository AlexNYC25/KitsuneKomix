import { Context, Hono } from "hono";

import { purgeAllData } from "../db/sqlite/models/admin.model.ts";

const app = new Hono();

app.post("/purge-data", async (c: Context) => {
  await purgeAllData();

  return c.json({ message: "All data purged successfully" }, 200);
});

export default app;
