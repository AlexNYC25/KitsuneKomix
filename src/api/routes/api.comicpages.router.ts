import { Context, Hono } from "hono";
import { z } from "zod";

const app = new Hono();

app.get("/duplicates", async (c: Context) => {
  //TODO: implement duplicate detection logic
  return c.json({ message: "Duplicate detection not implemented yet" }, 501);
});

app.get("/duplicates/:id", async (c: Context) => {
  const id = c.req.param("id");

  //TODO: implement duplicate detection logic for specific comic page
  return c.json({
    message: "Duplicate detection for comic page not implemented yet",
  }, 501);
});

app.post("/duplicates/:id/delete", async (c: Context) => {
  const body = await c.req.json();

  //TODO: implement duplicate deletion logic
  return c.json({ message: "Duplicate deletion not implemented yet" }, 501);
});
