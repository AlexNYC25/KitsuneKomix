import { OpenAPIHono } from "@hono/zod-openapi";
import z from "zod";
import { zValidator } from "@hono/zod-validator";
import { basename } from "@std/path";

import {
  deleteComicBook,
  getComicBookById,
  updateComicBook,
} from "../../db/sqlite/models/comicBooks.model.ts";
import {
  checkComicReadByUser,
  createCustomThumbnail,
  deleteComicsThumbnailById,
  fetchAllComicBooksWithRelatedData,
  fetchComicBookMetadataById,
  fetchComicBooksByLetter,
  fetchComicDuplicatesInTheDb,
  getComicBooksWithRelatedMetadata,
  getComicPagesInfo,
  getComicThumbnailByComicIdThumbnailId,
  getComicThumbnails,
  getNextComicBookId,
  getPreviousComicBookId,
  fetchRandomComicBook,
  setComicReadByUser,
  startStreamingComicBookFile,
} from "../services/comicbooks.service.ts";
import { ComicBook, ComicBookFilterItem, AllowedSortProperties, AllowedFilterProperties } from "../../types/index.ts";
import { ComicBookWithMetadata } from "../../types/comicBook.type.ts";

const app = new OpenAPIHono();

// This should be the expected json return type for routes that return multiple comic books with pagination info
type multipleReturnResponse = {
  data: ComicBook[]|ComicBookWithMetadata[];
  count: number;
  hasNextPage: boolean;
  currentPage: number;
  pageSize: number;
  filter: string | null;
  filterProperty: string | null;
  sort: string | null;
  sortProperty: string | null;
  sortOrder?: string | null;
};

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
      sortProperty: z.string().optional(),
      sortDirection: z.enum(["asc", "desc"]).optional(),
      filter: z.string().optional(),
      filterProperty: z.string().optional(),
    }),
  ),
  async (c) => {
    const { page, limit, sort, sortProperty, sortDirection, filter, filterProperty } = c.req.query();

    try {
      // Convert query parameters to the new service function format
      const filters: ComicBookFilterItem[] = [];
      if (filter && filterProperty) {
        filters.push({
          filterProperty: filterProperty as AllowedFilterProperties,
          filterValue: filter
        });
      }

      const pageNum = parseInt(page) || 1;
      const pageSize = parseInt(limit) || 20;
      const offset = (pageNum - 1) * pageSize;

      // Use the new optimized service function
      const comics = await getComicBooksWithRelatedMetadata(
        filters,
        (sortProperty as AllowedSortProperties) || 'created_at',
        sortDirection === "desc" ? "desc" : "asc",
        offset,
        pageSize + 1 // +1 to check for next page
      );

      // Check if there's a next page
      const hasNextPage = comics.length > pageSize;
      const resultComics = hasNextPage ? comics.slice(0, pageSize) : comics;

      const returnObj: multipleReturnResponse = {
        data: resultComics,
        count: resultComics.length,
        hasNextPage,
        currentPage: pageNum,
        pageSize: pageSize,
        filter: filter || null,
        filterProperty: filterProperty || null,
        sort: sort || null,
        sortProperty: sortProperty || null,
        sortOrder: sortDirection === "desc" ? "desc" : "asc",
      };

      return c.json(returnObj);
    } catch (error) {
      console.error("API Route Error:", error);
      return c.json({ error: "Failed to fetch comic books" }, 500);
    }
  },
);

/**
 * Get comic book duplicates
 *
 * GET /api/comic-books/duplicates
 *
 * This route returns a list of duplicate comic books based on the unique hash generated for each comic book
 */
app.get(
  "/duplicates",
  zValidator(
    "query",
    z.object({
      page: z.string().optional().transform((val) => (val ? parseInt(val) : 1)),
      limit: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : 20)),
    }),
  ),
  async (c) => {
    const page = c.req.query("page") ? parseInt(c.req.query("page")!) : 1;
    const limit = c.req.query("limit") ? parseInt(c.req.query("limit")!) : 20;

    try {
      const duplicates = await fetchComicDuplicatesInTheDb({
        page: page,
        pageSize: limit,
      });

    if (duplicates) {
      return c.json({
        duplicates: duplicates,
        message: "Fetched comic book duplicates successfully",
      });
    } else {
      return c.json({
        message: "No duplicate comic books found",
      });
    }
  } catch (error) {
    console.error("Error fetching comic book duplicates:", error);
    return c.json({ error: "Failed to fetch comic book duplicates" }, 500);
  }
});

/**
 * Get the latest comic books added to the database
 *
 * GET /api/comic-books/latest
 *
 * This route returns the latest comic books added to the database, sorted by the date they were added
 */
app.get(
  "/latest",
  zValidator(
    "query",
    z.object({
      page: z.string().optional().transform((val) => (val ? parseInt(val) : 1)),
      limit: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : 10)),
    }),
  ),
  async (c) => {
    const page = c.req.query("page") ? parseInt(c.req.query("page")!) : 1;
    const limit = c.req.query("limit") ? parseInt(c.req.query("limit")!) : 20;

    try {
      const comicsResult = await fetchAllComicBooksWithRelatedData(
        {
          page: page,
          pageSize: limit,
        },
        {
          filter: undefined,
          filterProperty: undefined,
        },
        {
          sort: "created_at",
          sortProperty: "created_at",
          sortOrder: "desc",
        },
      );
      return c.json({
        data: comicsResult.comics,
        count: comicsResult.comics.length,
        currentPage: page,
        pageSize: limit,
      });
    } catch (error) {
      console.error("Error fetching latest comic books:", error);
      return c.json({ error: "Failed to fetch latest comic books" }, 500);
    }
  },
);

/**
 * Get the newest comic books by publication date
 *
 * GET /api/comic-books/newest
 *
 * This route returns the newest comic books sorted by their publication date
 */
app.get(
  "/newest",
  zValidator(
    "query",
    z.object({
      page: z.string().optional().transform((val) => (val ? parseInt(val) : 1)),
      limit: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : 10)),
    }),
  ),
  async (c) => {
    const page = c.req.query("page") ? parseInt(c.req.query("page")!) : 1;
    const limit = c.req.query("limit") ? parseInt(c.req.query("limit")!) : 20;

    try {
      const comicsResult = await fetchAllComicBooksWithRelatedData(
        {
          page: page,
          pageSize: limit,
        },
        {
          filter: undefined,
          filterProperty: undefined,
        },
        {
          sort: "publication_date",
          sortProperty: "publication_year",
          sortOrder: "desc",
        },
      );
      return c.json({
        data: comicsResult.comics,
        count: comicsResult.comics.length,
        currentPage: page,
        pageSize: limit,
        hasNextPage: comicsResult.hasNextPage,
      });
    } catch (error) {
      console.error("Error fetching newest comic books:", error);
      return c.json({ error: "Failed to fetch newest comic books" }, 500);
    }
  },
);

/**
 * Get a random comic book
 *
 * GET /api/comic-books/random
 *
 * This route returns a random comic book from the database
 */
app.get(
  "/random", 
  zValidator(
    "query",
    z.object({
      count: z.string().optional().transform((val) => (val ? parseInt(val) : 1)),
    }),
  ),
  async (c) => {
    const count = c.req.query("count") ? parseInt(c.req.query("count")!) : 1;

    try {
      const comic = await fetchRandomComicBook(count);
      return c.json(comic);
    } catch (error) {
      console.error("Error fetching random comic book:", error);
      return c.json({ error: "Failed to fetch random comic book" }, 500);
    }
  }
);

app.get(
  "/list",
  zValidator(
    "query",
    z.object({
      page: z.string().optional().transform((val) => (val ? parseInt(val) : 1)),
      limit: z.string().optional().transform((val) => (val ? parseInt(val) : 20)),
      letter: z.string().optional().transform((val) => val || "A"),
    }),
  ),
  async (c) => {
    const page = c.req.query("page") ? parseInt(c.req.query("page")!) : 1;
    const limit = c.req.query("limit") ? parseInt(c.req.query("limit")!) : 20;
    const letter = c.req.query("letter") || "A";

    try {
      const comicsResult = await fetchComicBooksByLetter(
        letter,
        { page: page, pageSize: limit }
      );
      return c.json({
        data: comicsResult,
        count: comicsResult.length,
        currentPage: page,
        pageSize: limit,
      });
    } catch (error) {
      console.error("Error fetching comic book list:", error);
      return c.json({ error: "Failed to fetch comic book list" }, 500);
    }
  }
);

app.get("/queue", (_c) => {
  //TODO: implement queue logic
  return _c.json({ message: "Queue not implemented yet" }, 501);
});

// Note this should be a batch update of metadata for multiple comic books either adding or replacing existing metadata
app.post("/metadata-batch", async (c) => {
  const _metadata = await c.req.json();

  //TODO: implement metadata update logic
  return c.json({ message: "Metadata update not implemented yet" }, 501);
});

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
  async (c) => {
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
  async (c) => {
    const id = parseInt(c.req.param("id"), 10);

    const metadata = await fetchComicBookMetadataById(id);
    if (metadata) {
      return c.json(metadata);
    } else {
      return c.notFound();
    }
  },
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
app.get("/:id/download", async (c) => {
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
  const comicContentType = "application/octet-stream";

  const fileOpen = await Deno.open(filePath, { read: true });
  const fileSize = (await Deno.stat(filePath)).size;

  // Create response with explicit headers
  const response = new Response(fileOpen.readable, {
    headers: {
      "Content-Type": comicContentType,
      "Content-Disposition": `attachment; filename="${sanitizedFileName}"`,
      "Content-Length": fileSize.toString(),
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff",
    },
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
  async (c) => {
    const id = c.req.param("id");

    const requestImageHeader = c.req.header("Accept") || "";
    console.log("Request Accept Header:", requestImageHeader);

    const result = await startStreamingComicBookFile(
      parseInt(id, 10),
      1,
      requestImageHeader,
      10,
    );

    return c.json(result);
  },
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
  async (c) => {
    const id = c.req.param("id");
    const page = c.req.param("page");

    try {
      const requestImageHeader = c.req.header("Accept") || "";

      const result = await startStreamingComicBookFile(
        parseInt(id, 10),
        parseInt(page, 10),
        requestImageHeader,
        10,
      );

      return c.json(result);
    } catch (error) {
      console.error("Error streaming comic book file:", error);
      return c.json({ error: "Failed to stream comic book file test" }, 500);
    }
  },
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
app.get(
  "/:id/pages",
  zValidator(
    "param",
    z.object({
      id: z.string().regex(/^\d+$/).transform(Number),
    }),
  ),
  async (c) => {
    const id = c.req.param("id");

    try {
      const result = await getComicPagesInfo(parseInt(id, 10));

      return c.json(result);
    } catch (error) {
      console.error("Error fetching comic book pages info:", error);
      return c.json({ error: "Failed to fetch comic book pages info" }, 500);
    }
  },
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
  // requireAuth - TODO: Add auth middleware for OpenAPIHono,
  zValidator(
    "param",
    z.object({
      id: z.string().regex(/^\d+$/).transform(Number),
    }),
  ),
  async (c) => {
    const id = c.req.param("id");
    // TODO: Implement proper auth check
    // const userId = c.get("user").sub;
    const userId = 1; // Placeholder until auth is properly migrated

    const hasRead = await checkComicReadByUser(userId, parseInt(id, 10));
    return c.json({ hasRead });
  },
);

/**
 * Mark a comic book as read by a user
 *
 * POST /api/comic-books/:id/read
 *
 * This should mark the comic book as read by the user, with the user id being read from the jwt token provided in the Authorization header
 */
app.post(
  "/:id/read",
  // requireAuth - TODO: Add auth middleware for OpenAPIHono,
  zValidator(
    "param",
    z.object({
      id: z.string().regex(/^\d+$/).transform(Number),
    }),
  ),
  async (c) => {
    const id = c.req.param("id");
    // TODO: Implement proper auth check
    // const userId = c.get("user").sub;
    const userId = 1; // Placeholder until auth is properly migrated

    const success = await setComicReadByUser(userId, parseInt(id, 10), true);
    if (success) {
      return c.json({ message: "Comic book marked as read" });
    } else {
      return c.json({ error: "Failed to mark comic book as read" }, 500);
    }
  },
);

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
  async (c) => {
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
  async (c) => {
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
  async (c) => {
    const id = c.req.param("id");

    try {
      const nextComic = await getNextComicBookId(parseInt(id, 10));
      if (nextComic) {
        return c.json({
          nextComic: nextComic,
          message: "Fetched next comic book successfully",
        });
      } else {
        return c.json({
          message: "No next comic book found",
        });
      }
    } catch (error) {
      console.error("Error fetching next comic book:", error);
      return c.json({ error: "Failed to fetch next comic book" }, 500);
    }
  },
);

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
  async (c) => {
    const id = c.req.param("id");

    try {
      const previousComic = await getPreviousComicBookId(parseInt(id, 10));
      if (previousComic) {
        return c.json({
          previousComic: previousComic,
          message: "Fetched previous comic book successfully",
        });
      } else {
        return c.json({
          message: "No previous comic book found",
        });
      }
    } catch (error) {
      console.error("Error fetching previous comic book:", error);
      return c.json({ error: "Failed to fetch previous comic book" }, 500);
    }
  },
);

/**
 * Get all thumbnails for a comic book by ID
 *
 * GET /api/comic-books/:id/thumbnails
 *
 * This should return all thumbnails for a comic book, both generated and custom ones
 */
app.get("/:id/thumbnails", async (c) => {
  const id = c.req.param("id");

  try {
    const thumbnails = await getComicThumbnails(parseInt(id, 10));
    if (thumbnails) {
      return c.json({
        thumbnails: thumbnails,
        message: "Fetched comic book thumbnails successfully",
      });
    } else {
      return c.json({
        message: "No thumbnails found for this comic book",
      });
    }
  } catch (error) {
    console.error("Error fetching comic book thumbnails:", error);
    return c.json({ error: "Failed to fetch comic book thumbnails" }, 500);
  }
});

/**
 * Get a specific thumbnail for a comic book by ID and thumbnail ID
 *
 * GET /api/comic-books/:id/thumbnails/:thumbId
 *
 * This should return a specific thumbnail for a comic book by its ID and the thumbnail ID
 */
app.get("/:id/thumbnails/:thumbId", async (c) => {
  const id = c.req.param("id");
  const thumbId = c.req.param("thumbId");

  try {
    const thumbnail = await getComicThumbnailByComicIdThumbnailId(
      parseInt(id, 10),
      parseInt(thumbId, 10),
    );
    if (thumbnail) {
      return c.json({
        thumbnail: thumbnail,
        message: "Fetched comic book thumbnail successfully",
      });
    } else {
      return c.json({
        message:
          "No thumbnail found for this comic book with the provided thumbnail ID",
      });
    }
  } catch (error) {
    console.error("Error fetching comic book thumbnail:", error);
    return c.json({ error: "Failed to fetch comic book thumbnail" }, 500);
  }
});

/**
 * Delete a specific thumbnail for a comic book by ID and thumbnail ID
 *
 * DELETE /api/comic-books/:id/thumbnails/:thumbId
 *
 * This should delete a specific thumbnail for a comic book by its ID and the thumbnail ID,
 * the comic book id is provided for validation purposes so its a 2 point check
 */
app.delete("/:id/thumbnails/:thumbId", async (c) => {
  const id = c.req.param("id");
  const thumbId = c.req.param("thumbId");

  try {
    await deleteComicsThumbnailById(parseInt(id, 10), parseInt(thumbId, 10));
    return c.json({ message: "Comic book thumbnail deleted successfully" });
  } catch (error) {
    console.error("Error deleting comic book thumbnail:", error);
    return c.json({ error: "Failed to delete comic book thumbnail" }, 500);
  }
});

/**
 * Create a custom thumbnail for a comic book by ID
 *
 * POST /api/comic-books/:id/thumbnails
 *
 * This should create a custom thumbnail for a comic book by its ID
 */
app.post(
  "/:id/thumbnails",
  // requireAuth - TODO: Add auth middleware for OpenAPIHono
  async (c) => {
    const id = c.req.param("id");
    const comicId = parseInt(id, 10);

    if (isNaN(comicId)) {
      return c.json({ error: "Invalid comic book ID" }, 400);
    }

    try {
      // Get user from auth middleware
      // TODO: Implement proper auth check
      // const user = c.get("user");
      // const userId = parseInt(user.sub);
      const userId = 1; // Placeholder until auth is properly migrated

      // Parse the multipart form data
      const body = await c.req.parseBody();

      // Extract image file
      const imageFile = body.image;
      if (!imageFile || !(imageFile instanceof File)) {
        return c.json({ error: "Image file is required" }, 400);
      }

      // Optional name and description
      const name = body.name as string | undefined;
      const description = body.description as string | undefined;

      // Validate file type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!allowedTypes.includes(imageFile.type)) {
        return c.json({
          error: "Invalid file type. Supported types: JPEG, PNG, WebP",
        }, 400);
      }

      // Convert file to ArrayBuffer
      const imageData = await imageFile.arrayBuffer();

      // Create the custom thumbnail
      const result = await createCustomThumbnail(
        comicId,
        imageData,
        userId,
        name,
        description,
      );

      return c.json({
        message: "Custom thumbnail created successfully",
        thumbnail: {
          id: result.thumbnailId,
          filePath: result.filePath,
          name: name,
          description: description,
          type: "custom",
        },
      }, 201);
    } catch (error) {
      console.error("Error creating custom thumbnail:", error);

      if (error instanceof Error) {
        if (error.message.includes("not found")) {
          return c.json({ error: error.message }, 404);
        }
      }

      return c.json({ error: "Failed to create custom thumbnail" }, 500);
    }
  },
);

//TODO: Updated parsing to actually read the readlists from the db, have the table and model ready
app.get("/:id/readlists", (c) => {
  const _id = c.req.param("id");

  //TODO: implement comic book readlists retrieval logic
  return c.json({
    message: "Comic book readlists retrieval not implemented yet",
  }, 501);
});

export default app;
