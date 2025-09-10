import { Context, Hono } from "hono";
import z from "zod";
import { zValidator } from "@hono/zod-validator";

import {
  deleteComicBook,
  getAllComicBooks,
  getComicBookById,
  searchComicBooks,
  updateComicBook,
} from "../db/sqlite/models/comicBooks.model.ts";
import { ComicBook } from "../types/comicBook.type.ts";

const app = new Hono();

app.get("/get-all", async (c: Context) => {
  const comics = await getAllComicBooks();
  return c.json(comics);
});

app.get(
  "/get/:id",
  zValidator(
    "param",
    z.object({
      id: z.string().regex(/^\d+$/).transform(Number),
    }),
  ),
  async (c: Context) => {
    const id = Number(c.req.param("id"));

    const comic: ComicBook | null = await getComicBookById(id);
    if (comic) {
      return c.json(comic);
    } else {
      return c.notFound();
    }
  },
);

app.get(
  "/search",
  zValidator(
    "query",
    z.object({
      q: z.string().min(1, "Query parameter 'q' is required"),
    }),
  ),
  async (c: Context) => {
    const query = c.req.query("q");

    if (!query) {
      return c.json({ message: "Query parameter 'q' is required" }, 400);
    }

    const comics = await searchComicBooks(query);
    if (comics) {
      return c.json(comics);
    } else {
      return c.notFound();
    }
  },
);

app.put(
  "/update/:id",
  zValidator(
    "param",
    z.object({
      id: z.string().regex(/^\d+$/).transform(Number),
    }),
  ),
  zValidator(
    "json",
    z.object({
      title: z.string().optional(),
      series: z.string().optional(),
      issue_number: z.number().optional(),
      volume: z.string().optional(),
      publisher: z.string().optional(),
      year: z.number().optional(),
      summary: z.string().optional(),
      authors: z.array(z.string()).optional(),
      genres: z.array(z.string()).optional(),
      tags: z.array(z.string()).optional(),
      hash: z.string().optional(),
      page_count: z.number().optional(),
      review: z.string().optional(),
      age_rating: z.string().optional(),
      community_rating: z.number().min(0).max(5).optional(),
      file_size: z.number().optional(),
    }),
  ),
  async (c: Context) => {
    const id = Number(c.req.param("id"));
    const updates = await c.req.json();

    try {
      const success = await updateComicBook(id, updates);
      if (success) {
        return c.json({
          message: `Comic book with ID ${id} updated successfully`,
        });
      } else {
        return c.notFound();
      }
    } catch (error) {
      console.error("Error updating comic book:", error);
      return c.json({ message: "Internal server error" }, 500);
    }
  },
);

app.delete(
  "/delete/:id",
  zValidator(
    "param",
    z.object({
      id: z.string().regex(/^\d+$/).transform(Number),
    }),
  ),
  async (c: Context) => {
    const id = Number(c.req.param("id"));

    try {
      const success = await deleteComicBook(id);
      if (success) {
        return c.json({
          message: `Comic book with ID ${id} deleted successfully`,
        });
      } else {
        return c.notFound();
      }
    } catch (error) {
      console.error("Error deleting comic book:", error);
      return c.json({ message: "Internal server error" }, 500);
    }
  },
);

export default app;
