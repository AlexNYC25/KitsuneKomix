import { Context, Hono } from "hono";
import { z } from "zod";

const app = new Hono();

app.get("/", async (c: Context) => {
  // TODO: use the model/service to get the series from the database
  return c.json({ message: "Comic Series API is running" }, 200);
});

app.get("/:id", async (c: Context) => {
  const id = c.req.param("id");
  // TODO: use the model/service to get the series with the given ID from the database
  return c.json({ message: `Comic Series API is running for ID ${id}` }, 200);
});

app.get("/:id/analyse", async (c: Context) => {
  const id = c.req.param("id");
  // TODO: use the model/service to analyze the series with the given ID
  return c.json({
    message: `Comic Series API is running for ID ${id} - Analysis`,
  }, 200);
});

app.get("/:id/download", async (c: Context) => {
  const id = c.req.param("id");
  // TODO: use the model/service to download the series with the given ID
  return c.json({
    message: `Comic Series API is running for ID ${id} - Download`,
  }, 200);
});

app.patch("/:id/metadata", async (c: Context) => {
  const id = c.req.param("id");
  // TODO: use the model/service to update the metadata for the series with the given ID
  return c.json({
    message: `Comic Series API is running for ID ${id} - Metadata Update`,
  }, 200);
});

app.post("/:id/progress", async (c: Context) => {
  const id = c.req.param("id");
  // TODO: use the model/service to update the progress for the series with the given ID
  return c.json({
    message: `Comic Series API is running for ID ${id} - Progress Update`,
  }, 200);
});

app.get("/:id/thumbnails", async (c: Context) => {
  const id = c.req.param("id");
  // TODO: use the model/service to get the thumbnails for the series with the given ID
  return c.json({
    message: `Comic Series API is running for ID ${id} - Thumbnails`,
  }, 200);
});

app.post("/:id/thumbnail", async (c: Context) => {
  const id = c.req.param("id");
  // TODO: use the model/service to create a thumbnail for the series with the given ID
  return c.json({
    message: `Comic Series API is running for ID ${id} - Thumbnail Creation`,
  }, 200);
});

app.delete("/:id/thumbnail/:thumbId", async (c: Context) => {
  const id = c.req.param("id");
  const thumbId = c.req.param("thumbId");
  // TODO: use the model/service to delete the thumbnail for the series with the given ID
  return c.json({
    message: `Comic Series API is running for ID ${id} - Thumbnail Deletion`,
  }, 200);
});

app.get("/:id/thumbnails/:thumbId", async (c: Context) => {
  const id = c.req.param("id");
  const thumbId = c.req.param("thumbId");
  // TODO: use the model/service to get the thumbnail for the series with the given ID
  return c.json({
    message: `Comic Series API is running for ID ${id} - Thumbnail Retrieval`,
  }, 200);
});

app.put("/:id/thumbnail/:thumbId/cover", async (c: Context) => {
  const id = c.req.param("id");
  const thumbId = c.req.param("thumbId");
  // TODO: use the model/service to update the cover for the thumbnail with the given ID
  return c.json({
    message:
      `Comic Series API is running for ID ${id} - Thumbnail Cover Update`,
  }, 200);
});

app.get("/latest", async (c: Context) => {
  // TODO: use the model/service to get the latest series from the database
  return c.json({ message: "Latest Comic Series API is running" }, 200);
});

app.get("/alphabetical", async (c: Context) => {
  // TODO: use the model/service to get the alphabetical series from the database
  return c.json({ message: "Alphabetical Comic Series API is running" }, 200);
});

app.get("/alphabetical/:letter", async (c: Context) => {
  const letter = c.req.param("letter");
  // TODO: use the model/service to get the series starting with the given letter from the database
  return c.json({
    message: `Alphabetical Comic Series API is running for letter ${letter}`,
  }, 200);
});

app.get("/new", async (c: Context) => {
  // TODO: use the model/service to get the new series from the database
  return c.json({ message: "New Comic Series API is running" }, 200);
});

app.get("/updated", async (c: Context) => {
  // TODO: use the model/service to get the updated series from the database
  return c.json({ message: "Updated Comic Series API is running" }, 200);
});

export default app;
