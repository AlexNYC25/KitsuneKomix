import { Context, Hono } from "hono";
import z from "zod";
import { zValidator } from "@hono/zod-validator";
import { basename } from "@std/path";


import {
  deleteComicBook,
  getComicBookById,
  searchComicBooks,
  updateComicBook,
} from "../db/sqlite/models/comicBooks.model.ts";
import { fetchAllComicBooksWithRelatedData, fetchComicBookMetadataById } from "../services/comicbooks.service.ts";
import { ComicBook } from "../types/index.ts";

const app = new Hono();

/**
 * Get a comic book by ID
 * ROUTE: GET /api/comic-books/:id
 * 
 * This should return a single comic book by its ID
 * 
 * At the moment it only returns the basic comic book info, but it can be expanded to include related metadata as needed
 * or for now just use this to get a shallow copy of the comic book and then call /:id/metadata to get the full metadata
 * @param id - The ID of the comic book to retrieve
 * @return JSON object of the comic book
 */
app.get(
  "/:id",
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
  "/:id/metadata",
  zValidator(
    "param",
    z.object({
      id: z.string().regex(/^\d+$/).transform(Number),
    }),
  ),
  async (c: Context) => {
    const id = parseInt(c.req.param("id"), 10);

    const metadata = await fetchComicBookMetadataById(id);
    if (metadata) {
      return c.json(metadata);
    } else {
      return c.notFound();
    }
  }
);

/**
 * Download a comic book by ID
 * 
 * GET /api/comic-books/:id/download
 * 
 * This should return the comic book file as a download
 * @param id - The ID of the comic book to download
 * @return The comic book file as a download
 * 
 * TODO: TEST for large files
 */
app.get("/:id/download", async (c: Context) => {
  const id = Number(c.req.param("id"));

  const comic: ComicBook | null = await getComicBookById(id);
  if (!comic) {
    return c.notFound();
  }

  const filePath = comic.file_path;
  const originalFileName = basename(filePath);
  
  // Sanitize filename but preserve the original extension and more characters
  // Remove only problematic characters for file systems
  const sanitizedFileName = originalFileName.replace(/[<>:"/\\|?*]/g, "_");
  
  // Handle comic book file types specifically
  // Force generic binary download to prevent browser interpretation
  const comicContentType = 'application/octet-stream';

  const fileOpen = await Deno.open(filePath, { read: true });
  const fileSize = (await Deno.stat(filePath)).size;

  // Create response with explicit headers
  const response = new Response(fileOpen.readable, {
    headers: {
      "Content-Type": comicContentType,
      "Content-Disposition": `attachment; filename="${sanitizedFileName}"`,
      "Content-Length": fileSize.toString(),
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff"
    }
  });

  return response;
});

app.get("/:id/stream", async (c: Context) => {
  const id = c.req.param("id");

  //TODO: implement comic book stream logic
  return c.json({ message: "Comic book stream not implemented yet" }, 501);
});

app.get("/:id/stream/:page", async (c: Context) => {
  const id = c.req.param("id");
  const page = c.req.param("page");

  //TODO: implement comic book stream logic
  return c.json({ message: "Comic book stream not implemented yet" }, 501);
});

app.get("/:id/pages", async (c: Context) => {
  const id = c.req.param("id");

  //TODO: implement comic book pages retrieval logic
  return c.json({ message: "Comic book pages retrieval not implemented yet" }, 501);
});

app.get("/:id/read", async (c: Context) => {
  const id = c.req.param("id");

  //TODO: implement comic book read logic
  return c.json({ message: "Comic book read not implemented yet" }, 501);
});

app.put(
  "/:id/update",
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
  "/:id/delete",
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

app.get("/:id/next", async (c: Context) => {
  const id = c.req.param("id");

  //TODO: implement comic book next logic
  return c.json({ message: "Comic book next not implemented yet" }, 501);
});

app.get("/:id/previous", async (c: Context) => {
  const id = c.req.param("id");

  //TODO: implement comic book previous logic
  return c.json({ message: "Comic book previous not implemented yet" }, 501);
});

app.post("/:id/read", async (c: Context) => {
  const id = c.req.param("id");

  //TODO: implement comic book read logic
  return c.json({ message: "Comic book read not implemented yet" }, 501);
});

app.get("/:id/readlists", async (c: Context) => {
  const id = c.req.param("id");

  //TODO: implement comic book readlists retrieval logic
  return c.json({ message: "Comic book readlists retrieval not implemented yet" }, 501);
});

app.get("/:id/thumbnails", async (c: Context) => {
  const id = c.req.param("id");

  //TODO: implement comic book thumbnails retrieval logic
  return c.json({ message: "Comic book thumbnails retrieval not implemented yet" }, 501);
});

app.get("/:id/thumbnails/:thumbId", async (c: Context) => {
  const id = c.req.param("id");
  const thumbId = c.req.param("thumbId");

  //TODO: implement comic book thumbnail retrieval logic
  return c.json({ message: "Comic book thumbnail retrieval not implemented yet" }, 501);
});

app.delete("/:id/thumbnail/:thumbId", async (c: Context) => {
  const id = c.req.param("id");
  const thumbId = c.req.param("thumbId");

  //TODO: implement comic book thumbnail deletion logic
  return c.json({ message: "Comic book thumbnail deletion not implemented yet" }, 501);
});

app.post("/:id/thumbnail", async (c: Context) => {
  const id = c.req.param("id");

  //TODO: implement comic book thumbnail upload logic
  return c.json({ message: "Comic book thumbnail upload not implemented yet" }, 501);
});

/**
 * Get all comic books
 * ROUTE: GET /api/comic-books/all
 * 
 * This should return a list of all comic books in the database, with the option of pagination, sorting, and filtering
 * @return JSON array of comic books
 */
app.get(
  "/all",
  zValidator(
    "query",
    z.object({
      page: z.string().optional().transform((val) => (val ? parseInt(val) : 1)),
      limit: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : 20)),
      sort: z.string().optional(),
      filter: z.string().optional(),
      filter_property: z.string().optional(),
    }),
  ),
  async (c: Context) => {
    const { page, limit, sort, filter, filter_property } = c.req.query();
    
    try {
      const serviceResult = await fetchAllComicBooksWithRelatedData(parseInt(page) || 1, parseInt(limit) || 20, sort, filter, filter_property);

      return c.json({
        data: serviceResult.comics,
        count: serviceResult.comics.length,
        hasNextPage: serviceResult.hasNextPage,
        currentPage: parseInt(page) || 1,
        pageSize: parseInt(limit) || 100,
        filter: filter || null,
        filter_property: filter_property || null,
        sort: sort || null,
      });
    } catch (error) {
      console.error("API Route Error:", error);
      return c.json({ error: "Failed to fetch comic books" }, 500);
    }
  },
);

// TODO: Re consider this route it may be redundant with the current filter implementation in /all
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

app.get("/duplicates", async (c: Context) => {
  //TODO: implement duplicate detection logic
  return c.json({ message: "Duplicate detection not implemented yet" }, 501);
});

app.get("/latest", async (c: Context) => {
  //TODO: implement latest comics retrieval logic
  return c.json({ message: "Latest comics retrieval not implemented yet" }, 501);
});

app.get("/random", async (c: Context) => {
  //TODO: implement random comic retrieval logic
  return c.json({ message: "Random comic retrieval not implemented yet" }, 501);
});

app.get("/list", async (c: Context) => {
  //TODO: implement comic book list retrieval logic
  return c.json({ message: "Comic book list retrieval not implemented yet" }, 501);
});

app.get("/queue", async (c: Context) => {
  //TODO: implement comic book queue retrieval logic
  return c.json({ message: "Comic book queue retrieval not implemented yet" }, 501);
});

app.post("/metadata", async (c: Context) => {
  const metadata = await c.req.json();

  //TODO: implement metadata update logic
  return c.json({ message: "Metadata update not implemented yet" }, 501);
});

app.post("/metadata-batch", async (c: Context) => {
  const metadata = await c.req.json();

  //TODO: implement metadata update logic
  return c.json({ message: "Metadata update not implemented yet" }, 501);
});

export default app;
