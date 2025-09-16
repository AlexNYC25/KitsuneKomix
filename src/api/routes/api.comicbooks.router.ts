import { Context, Hono } from "hono";
import z from "zod";
import { zValidator } from "@hono/zod-validator";
import { basename } from "@std/path";

import { requireAuth } from "../middleware/authChecks.ts";
import {
  deleteComicBook,
  getComicBookById,
  searchComicBooks,
  updateComicBook,
} from "../db/sqlite/models/comicBooks.model.ts";
import { 
  fetchAllComicBooksWithRelatedData, 
  fetchComicBookMetadataById, 
  startStreamingComicBookFile, 
  getComicPagesInfo,
  getNextComicBookId,
  getPreviousComicBookId,
  getComicDuplicatesInTheDb,
  checkComicReadByUser,
  setComicReadByUser
} from "../services/comicbooks.service.ts";
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


/**
 * Get a comic book with its full metadata by ID
 * ROUTE: GET /api/comic-books/:id/metadata
 * 
 * This should return a single comic book with its full metadata by its ID
 * @param id - The ID of the comic book to retrieve
 * @return JSON object of the comic book with its full metadata
 */
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

/**
 * Stream a comic book page by page, this should be the first step in a reading session
 * 
 * GET /api/comic-books/:id/stream
 * 
 * This should return the first page of the comic book and a token to continue streaming:
 *  - Starts the preloading of the next comic book pages in the background
 *  - TODO: Set the progress of the reading session in the db 
 *  - TODO: Look into adding a flag to set the request to private so we don't log the reading progress in the db
 */
app.get(
  "/:id/stream",
  zValidator(
    "param",
    z.object({
      id: z.string().regex(/^\d+$/).transform(Number),
    }),
  ),
  async (c: Context) => {
    const id = c.req.param("id");

    const requestImageHeader = c.req.header("Accept") || "";
    console.log("Request Accept Header:", requestImageHeader);

    const result = await startStreamingComicBookFile(parseInt(id, 10), 1, requestImageHeader, 10);

    return c.json(result);
  }
);

/**
 * Stream a specific page of a comic book by ID
 * 
 * GET /api/comic-books/:id/stream/:page
 * 
 * This should return the specified page of the comic book
 *  - Continues the preloading of the next comic book pages in the background
 *  - TODO: Either sets or updates the progress of the reading session in the db
 */
app.get(
  "/:id/stream/:page",
  zValidator(
    "param",
    z.object({
      id: z.string().regex(/^\d+$/).transform(Number),
      page: z.string().regex(/^\d+$/).transform(Number),
    }),
  ),
  async (c: Context) => {
    const id = c.req.param("id");
    const page = c.req.param("page");

    try {
      const requestImageHeader = c.req.header("Accept") || "";

      const result = await startStreamingComicBookFile(parseInt(id, 10), parseInt(page, 10), requestImageHeader, 10);

      return c.json(result);

    } catch (error) {    
      console.error("Error streaming comic book file:", error);
      return c.json({ error: "Failed to stream comic book file test" }, 500);
    }

  }
);

/**
 * Get information about the pages of a comic book by ID
 * 
 * GET /api/comic-books/:id/pages
 * 
 * This should return information about the pages of the comic book such as:
 * - Total number of pages in the comic book according to the metadata
 * - Total number of pages actually extracted and stored in the database
 * - array of page numbers and their corresponding ids
 */
app.get("/:id/pages",
  zValidator(
    "param",
    z.object({
      id: z.string().regex(/^\d+$/).transform(Number),
    }),
  ),
  async (c: Context) => {
    const id = c.req.param("id");

    try {
      const result = await getComicPagesInfo(parseInt(id, 10));

      return c.json(result);

    } catch (error) {    
      console.error("Error fetching comic book pages info:", error);
      return c.json({ error: "Failed to fetch comic book pages info" }, 500);
    }
  }
);

/**
 * Check if a comic book has been read by a user
 * 
 * GET /api/comic-books/:id/read
 * 
 * This should return whether the comic book has been marked as read by the user, with the user id being read from 
 * the jwt token provided in the Authorization header
 */
app.get(
  "/:id/read", 
  requireAuth,
  zValidator(
    "param",
    z.object({
      id: z.string().regex(/^\d+$/).transform(Number),
    }),
  ),
  async (c: Context) => {
    const id = c.req.param("id");
    const userId = c.get("user").sub;

    const hasRead = await checkComicReadByUser(userId, parseInt(id, 10));
    return c.json({ hasRead });
});

/**
 * Mark a comic book as read by a user
 * 
 * POST /api/comic-books/:id/read
 *
 * This should mark the comic book as read by the user, with the user id being read from the jwt token provided in the Authorization header
 */
app.post(
  "/:id/read",
  requireAuth,
  zValidator(
    "param",
    z.object({
      id: z.string().regex(/^\d+$/).transform(Number),
    }),
  ),
  async (c: Context) => {
  const id = c.req.param("id");
  const userId = c.get("user").sub;

  const success = await setComicReadByUser(userId, parseInt(id, 10), true);
  if (success) {
    return c.json({ message: "Comic book marked as read" });
  } else {
    return c.json({ error: "Failed to mark comic book as read" }, 500);
  }
});

/**
 * Update a comic book by ID, partial updates allowed
 * 
 * PUT /api/comic-books/:id/update
 *
 * This should allow partial updates to a comic book's metadata, specifically to certain fields:
 * - title
 * - series (name only, not the ID)
 * - issue_number
 * - volume
 * - publisher
 * - year
 * - summary
 * - authors
 * - genres
 * - tags
 * - hash
 * - page_count
 * - review
 * - age_rating
 * - community_rating
 * - file_size
 * 
 * TODO: Reconsider some fields like hash and file_size, should they be updatable?
 */
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

/**
 * Delete a comic book by ID
 * 
 * DELETE /api/comic-books/:id/delete
 * 
 * This should delete a comic book by its ID
 */
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

/**
 * Get the next comic book in the series, returning back the comic book of the next issue number
 * 
 * GET /api/comic-books/:id/next
 * 
 * This should return the next comic book in the same series based on the issue number
 */
app.get(
  "/:id/next",
  zValidator(
    "param",
    z.object({
      id: z.string().regex(/^\d+$/).transform(Number),
    }),
  ),
  async (c: Context) => {
    const id = c.req.param("id");

  try {
    const nextComic = await getNextComicBookId(parseInt(id, 10));
    if (nextComic) {
      return c.json({
        nextComic: nextComic,
        message: "Fetched next comic book successfully"
      });
    } else {
      return c.json({
        message: "No next comic book found"
      });
    }
  } catch (error) {
    console.error("Error fetching next comic book:", error);
    return c.json({ error: "Failed to fetch next comic book" }, 500);
  }
});

/**
 * Get the previous comic book in the series, returning back the comic book of the previous issue number
 * 
 * GET /api/comic-books/:id/previous
 * 
 * This should return the previous comic book in the same series based on the issue number
 */
app.get(
  "/:id/previous",
  zValidator(
    "param",
    z.object({
      id: z.string().regex(/^\d+$/).transform(Number),
    }),
  ),
  async (c: Context) => {
  const id = c.req.param("id");

  try {
    const previousComic = await getPreviousComicBookId(parseInt(id, 10));
    if (previousComic) {
      return c.json({
        previousComic: previousComic,
        message: "Fetched previous comic book successfully"
      });
    } else {
      return c.json({
        message: "No previous comic book found"
      });
    }
  } catch (error) {
    console.error("Error fetching previous comic book:", error);
    return c.json({ error: "Failed to fetch previous comic book" }, 500);
  }
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

app.get("/:id/readlists", async (c: Context) => {
  const id = c.req.param("id");

  //TODO: implement comic book readlists retrieval logic
  return c.json({ message: "Comic book readlists retrieval not implemented yet" }, 501);
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
  try {
    const duplicates = await getComicDuplicatesInTheDb();

    if (duplicates) {
      return c.json({
        duplicates: duplicates,
        message: "Fetched comic book duplicates successfully"
      });
    } else {
      return c.json({
        message: "No duplicate comic books found"
      });
    }
  } catch (error) {
    console.error("Error fetching comic book duplicates:", error);
    return c.json({ error: "Failed to fetch comic book duplicates" }, 500);
  }
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
