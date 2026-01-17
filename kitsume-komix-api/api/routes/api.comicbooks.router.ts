import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import z from "zod";
import { zValidator } from "@hono/zod-validator";
import { basename } from "@std/path";
import camelcasekeys from "camelcase-keys";

// TODO: Check if these model functions can be replaced with the appropriate service functions
import {
  deleteComicBook,
  getComicBookById,
  updateComicBook,
} from "#sqlite/models/comicBooks.model.ts";
import {
  getComicBooksInSeries,
} from "#sqlite/models/comicSeries.model.ts";


import {
  checkComicReadByUser,
  createCustomThumbnail,
  deleteComicsThumbnailById,
  fetchComicBookMetadataById,
  fetchComicBooksByLetter,
  fetchComicDuplicatesInTheDb,
  fetchRandomComicBook,
  fetchComicBooksWithRelatedMetadata,
  getComicPagesInfo,
  getComicThumbnailByComicIdThumbnailId,
  getComicThumbnails,
  getNextComicBookId,
  getPreviousComicBookId,
  setComicReadByUser,
  startStreamingComicBookFile,
  attachThumbnailToComicBook,
} from "../services/comicbooks.service.ts";

import type {
  ComicBook,
  MultipleReturnResponse,
  ComicBookThumbnail,
  AppEnv,
  RequestPaginationParametersValidated,
  RequestFilterParametersValidated,
  RequestSortParametersValidated,
  ComicSortField,
  ComicFilterField,
  RequestParametersValidated
} from "#types/index.ts";

import {
  ComicBooksResponseSchema,
  FlexibleResponseSchema,
  ComicBookMetadataResponseSchema,
  SuccessResponseSchema,
  ErrorResponseSchema,
  ComicBookReadByUserResponseSchema,
  ComicBookThumbnailsResponseSchema
} from "../../zod/schemas/response.schema.ts";
import {
  PaginationQuerySchema,
  PaginationQuerySchemaWithoutSortProperty,
  PaginationQueryNoFilterNoSortSchema,
  ComicBookUpdateSchema,
  ParamIdSchema
} from "../../zod/schemas/request.schema.ts";

import { requireAuth } from "../middleware/authChecks.ts";
import { validateAndBuildQueryParams, validatePagination } from "#utilities/parameters.ts";

const app = new OpenAPIHono<AppEnv>();

// Register Bearer Auth security scheme for OpenAPI
app.openAPIRegistry.registerComponent("securitySchemes", "Bearer", {
  type: "http",
  scheme: "bearer",
});

/**
 * GET /api/comic-books/all
 *
 * Get all comic books with pagination, sorting, and filtering
 */
app.openapi(
  createRoute({
    method: "get",
    path: "/all",
    summary: "Get all comic books",
    description: "Retrieve all comic books in the database with pagination, sorting, and filtering",
    tags: ["Comic Books"],
    request: {
      query: PaginationQuerySchema,
    },

    responses: {
      200: {
        content: {
          "application/json": {
            //TODO: Update to proper schema
            schema: FlexibleResponseSchema,
          },
        },
        description: "Comic books retrieved successfully",
      },
      500: {
        content: {
          "application/json": {
            //TODO: Update to proper schema
            schema: FlexibleResponseSchema,
          },
        },
        description: "Internal Server Error",
      },
    },
  }),
  async (c) => {
    const queryData: {
      page: number;
      pageSize: number;
      sort?: string | undefined;
      sortDirection?: "asc" | "desc" | undefined;
      filter?: string | undefined;
      filterProperty?: string | undefined;
    } = c.req.valid("query");

    const serviceData: RequestParametersValidated<ComicSortField, ComicFilterField> = validateAndBuildQueryParams(queryData, "comics");

    try {

      const comics = await fetchComicBooksWithRelatedMetadata(
        serviceData
      );

      const serviceDataPagination: RequestPaginationParametersValidated = serviceData.pagination;
      const serviceDataFilter: RequestFilterParametersValidated<ComicFilterField> | undefined = serviceData.filter;
      const serviceDataSort: RequestSortParametersValidated<ComicSortField> = serviceData.sort;

      // Check if there's a next page
      const hasNextPage = comics.length > serviceDataPagination.pageSize;
      const resultComics = hasNextPage ? comics.slice(0, serviceDataPagination.pageSize) : comics;

      const returnObj: MultipleReturnResponse = {
        data: resultComics,
        count: resultComics.length,
        hasNextPage,
        currentPage: serviceDataPagination.page,
        pageSize: serviceDataPagination.pageSize,
        filter: serviceDataFilter?.filter || null,
        filterProperty: serviceDataFilter?.filterProperty || null,
        sort: serviceDataSort.sortOrder === "desc" ? "desc" : "asc",
        sortProperty: serviceDataSort.sortProperty || null
      };

      return c.json(returnObj, 200);
    } catch (error) {
      console.error("API Route Error:", error);
      return c.json({ message: "Failed to fetch comic books" }, 500);
    }
  }
);

/**
 * Get the latest comic books added to the database
 *
 * GET /api/comic-books/latest
 *
 * This route returns the latest comic books added to the database, sorted by the date they were added
 */
app.openapi(
  createRoute({
    method: "get",
    path: "/latest",
    summary: "Get latest comic books",
    description: "Retrieve the latest comic books added to the database, sorted by creation date in descending order",
    tags: ["Comic Books"],
    request: {
      query: PaginationQuerySchemaWithoutSortProperty,
    },
    responses: {
      200: {
        content: {
          "application/json": {
            //TODO: Update to proper schema
            schema: FlexibleResponseSchema,
          },
        },
        description: "Latest comic books retrieved successfully",
      },
      500: {
        content: {
          "application/json": {
            //TODO: Update to proper schema
            schema: FlexibleResponseSchema,
          },
        },
        description: "Internal Server Error",
      },
    },
  }),
  async (c) => {
    const queryData: {
      page: number;
      pageSize: number;
      sort?: string | undefined;
      sortDirection?: "asc" | "desc" | undefined;
      filter?: string | undefined;
      filterProperty?: string | undefined;
    } = c.req.valid("query");

    queryData.sort = "createdAt";

    const serviceData: RequestParametersValidated<ComicSortField, ComicFilterField> = validateAndBuildQueryParams(queryData, "comics");

    try {
      const comics = await fetchComicBooksWithRelatedMetadata(
        serviceData
      );

      const serviceDataPagination: RequestPaginationParametersValidated = serviceData.pagination;
      const serviceDataFilter: RequestFilterParametersValidated<ComicFilterField> | undefined = serviceData.filter;
      const serviceDataSort: RequestSortParametersValidated<ComicSortField> = serviceData.sort;

      const hasNextPage = comics.length > serviceDataPagination.pageSize;
      const resultComics = hasNextPage ? comics.slice(0, serviceDataPagination.pageSize) : comics;

      const returnObj: MultipleReturnResponse = {
        data: resultComics,
        count: resultComics.length,
        hasNextPage,
        currentPage: serviceDataPagination.page,
        pageSize: serviceDataPagination.pageSize,
        filter: serviceDataFilter?.filter || null,
        filterProperty: serviceDataFilter?.filterProperty || null,
        sort: serviceDataSort.sortOrder === "desc" ? "desc" : "asc",
        sortProperty: serviceDataSort.sortProperty || null
      };

      return c.json(returnObj, 200);
    } catch (error) {
      console.error("Error fetching latest comic books:", error);
      return c.json({ error: "Failed to fetch latest comic books" }, 500);
    }
  }
);

/**
 * Get the newest comic books by publication date
 *
 * GET /api/comic-books/newest
 *
 * This route returns the newest comic books sorted by their publication date
 */
app.openapi(
  createRoute({
    method: "get",
    path: "/newest",
    summary: "Get newest comic books",
    description: "Retrieve the newest comic books sorted by publication date in descending order",
    tags: ["Comic Books"],
    request: {
      query: PaginationQuerySchemaWithoutSortProperty,
    },
    responses: {
      200: {
        content: {
          "application/json": {
            //TODO: Update to proper schema
            schema: FlexibleResponseSchema,
          },
        },
        description: "Newest comic books retrieved successfully",
      },
      500: {
        content: {
          "application/json": {
            //TODO: Update to proper schema
            schema: FlexibleResponseSchema,
          },
        },
        description: "Internal Server Error",
      },
    },
  }),
  async (c) => {
    const queryData: {
      page: number;
      pageSize: number;
      sort?: string | undefined;
      sortDirection?: "asc" | "desc" | undefined;
      filter?: string | undefined;
      filterProperty?: string | undefined;
    } = c.req.valid("query");

    queryData.sort = "date";

    const serviceData: RequestParametersValidated<ComicSortField, ComicFilterField> = validateAndBuildQueryParams(queryData, "comics");

    try {
      const comics = await fetchComicBooksWithRelatedMetadata(
        serviceData
      );

      const serviceDataPagination: RequestPaginationParametersValidated = serviceData.pagination;
      const serviceDataFilter: RequestFilterParametersValidated<ComicFilterField> | undefined = serviceData.filter;
      const serviceDataSort: RequestSortParametersValidated<ComicSortField> = serviceData.sort;

      const hasNextPage = comics.length > serviceDataPagination.pageSize;
      const resultComics = hasNextPage ? comics.slice(0, serviceDataPagination.pageSize) : comics;

      const returnObj: MultipleReturnResponse = {
        data: resultComics,
        count: resultComics.length,
        hasNextPage,
        currentPage: serviceDataPagination.page,
        pageSize: serviceDataPagination.pageSize,
        filter: serviceDataFilter?.filter || null,
        filterProperty: serviceDataFilter?.filterProperty || null,
        sort: serviceDataSort.sortOrder === "desc" ? "desc" : "asc",
        sortProperty: serviceDataSort.sortProperty || null
      };

      return c.json(returnObj, 200);
    } catch (error) {
      console.error("Error fetching latest comic books:", error);
      return c.json({ error: "Failed to fetch latest comic books" }, 500);
    }
  }
);

/**
 * GET /api/comic-books/duplicates
 *
 * Get duplicate comic books
 */
app.openapi(
  createRoute({
    method: "get",
    path: "/duplicates",
    summary: "Get duplicate comic books",
    description: "Retrieve duplicate comic books based on unique hash",
    tags: ["Comic Books"],
    request: {
      query: PaginationQueryNoFilterNoSortSchema
    },
    responses: {
      200: {
        content: {
          "application/json": {
            //TODO: Update to proper schema
            schema: FlexibleResponseSchema,
          },
        },
        description: "Duplicate comic books retrieved successfully",
      },
      500: {
        content: {
          //TODO: Update to proper schema
          "application/json": {
            schema: FlexibleResponseSchema,
          },
        },
        description: "Internal Server Error",
      },
    },
  }),
  async (c) => {
    const queryData: {
      page: number;
      pageSize: number;
    } = c.req.valid("query");

    const paginationData: RequestPaginationParametersValidated = validatePagination(queryData.page, queryData.pageSize);

    try {
      const duplicates: ComicBook[] = await fetchComicDuplicatesInTheDb({
        page: paginationData.page,
        pageSize: paginationData.pageSize,
      });

      if (duplicates.length > 0) {
        return c.json({
          data: duplicates,
          count: duplicates.length,
          hasNextPage: duplicates.length >= paginationData.pageSize,
          currentPage: paginationData.page,
          pageSize: paginationData.pageSize
        });
      } else {
        return c.json({
          data: [],
          count: 0,
          hasNextPage: false,
          currentPage: paginationData.page,
          pageSize: paginationData.pageSize
        });
      }
    } catch (error) {
      console.error("Error fetching comic book duplicates:", error);
      return c.json({ message: "Failed to fetch comic book duplicates" }, 500);
    }
  });

// HERE is the end of the current rewrite

/**
 * Get a random comic book
 *
 * GET /api/comic-books/random
 *
 * This route returns a random comic book from the database
 */
app.openapi(
  createRoute({
    method: "get",
    path: "/random",
    summary: "Get random comic book",
    description: "Retrieve a random comic book from the database",
    tags: ["Comic Books"],
    request: {
      query: z.object({
        count: z.string().optional().transform((val) => (val ? parseInt(val) : 1)).openapi({
          description: "Number of random comics to fetch",
          example: 1,
        }),
      }),
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: FlexibleResponseSchema,
          },
        },
        description: "Random comic book retrieved successfully",
      },
      500: {
        content: {
          "application/json": {
            schema: FlexibleResponseSchema,
          },
        },
        description: "Internal Server Error",
      },
    },
  }),
  async (c) => {
    const queryData = c.req.valid("query");
    const count = queryData.count || 1;

    try {
      const comic = await fetchRandomComicBook(count);
      return c.json(comic);
    } catch (error) {
      console.error("Error fetching random comic book:", error);
      return c.json({ error: "Failed to fetch random comic book" }, 500);
    }
  });

/**
 * Get comic books filtered by first letter
 */
app.openapi(
  createRoute({
    method: "get",
    path: "/list",
    summary: "Get comic books by letter",
    description: "Retrieve comic books filtered by their first letter with pagination",
    tags: ["Comic Books"],
    request: {
      query: z.object({
        page: z.string().optional().transform((val) => (val ? parseInt(val) : 1)).openapi({
          description: "Page number for pagination",
          example: 1,
        }),
        pageSize: z.string().optional().transform((val) => (val ? parseInt(val) : 20)).openapi({
          description: "Number of items per page",
          example: 20,
        }),
        letter: z.string().optional().transform((val) => val || "A").openapi({
          description: "First letter to filter by",
          example: "A",
        }),
      }),
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: FlexibleResponseSchema,
          },
        },
        description: "Comic books retrieved successfully",
      },
      500: {
        content: {
          "application/json": {
            schema: FlexibleResponseSchema,
          },
        },
        description: "Internal Server Error",
      },
    },
  }),
  async (c) => {
    const queryData = c.req.valid("query");
    const page = queryData.page || 1;
    const pageSize = queryData.pageSize || 20;
    const letter = queryData.letter || "A";

    try {
      const comicsResult = await fetchComicBooksByLetter(
        letter,
        { page: page, pageSize: pageSize },
      );
      return c.json({
        data: comicsResult,
        count: comicsResult.length,
        currentPage: page,
        pageSize: pageSize,
      });
    } catch (error) {
      console.error("Error fetching comic book list:", error);
      return c.json({ error: "Failed to fetch comic book list" }, 500);
    }
  });

/**
 * Get queue
 */
app.openapi(
  createRoute({
    method: "get",
    path: "/queue",
    summary: "Get processing queue status",
    description: "Retrieve the status of the comic book processing queue",
    tags: ["Comic Books"],
    responses: {
      200: {
        content: {
          "application/json": {
            schema: FlexibleResponseSchema,
          },
        },
        description: "Queue status retrieved",
      },
      501: {
        content: {
          "application/json": {
            schema: FlexibleResponseSchema,
          },
        },
        description: "Not implemented",
      },
    },
  }),
  (_c) => {
    //TODO: implement queue logic
    return _c.json({ message: "Queue not implemented yet" }, 501);
  });

/**
 * Batch update metadata
 */
app.openapi(
  createRoute({
    method: "post",
    path: "/metadata-batch",
    summary: "Batch update metadata",
    description: "Update metadata for multiple comic books",
    tags: ["Comic Books"],
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.any(),
          },
        },
      },
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: FlexibleResponseSchema,
          },
        },
        description: "Metadata updated",
      },
      501: {
        content: {
          "application/json": {
            schema: FlexibleResponseSchema,
          },
        },
        description: "Not implemented",
      },
    },
  }),
  async (c) => {
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
app.openapi(
  createRoute({
    method: "get",
    path: "/{id}",
    summary: "Get comic book by ID",
    description: "Retrieve a single comic book by its ID",
    tags: ["Comic Books"],
    request: {
      params: z.object({
        id: z.string().regex(/^\d+$/).transform(Number).openapi({
          description: "Comic book ID",
          example: 1,
        }),
      }),
      query: PaginationQuerySchema,
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: FlexibleResponseSchema,
          },
        },
        description: "Comic book retrieved successfully",
      },
      404: {
        content: {
          "application/json": {
            schema: FlexibleResponseSchema,
          },
        },
        description: "Comic book not found",
      },
      500: {
        content: {
          "application/json": {
            schema: FlexibleResponseSchema,
          },
        },
        description: "Internal Server Error",
      },
    },
  }),
  async (c) => {
    const id = Number(c.req.param("id"));

    const comic: ComicBook | null = await getComicBookById(id);
    if (comic) {
      const camelData = camelcasekeys(comic, { deep: true });
      return c.json(camelData);
    }
    return c.json({ error: "Comic book not found" }, 404);
  });

/**
 * Get a comic book with its full metadata by ID
 * ROUTE: GET /api/comic-books/:id/metadata
 *
 * This should return a single comic book with its full metadata by its ID
 * @param id - The ID of the comic book to retrieve
 * @return JSON object of the comic book with its full metadata or null
 */
app.openapi(
  createRoute({
    method: "get",
    path: "/{id}/metadata",
    summary: "Get comic book metadata by ID",
    description: "Retrieve a comic book with its full metadata by its ID",
    tags: ["Comic Books"],
    request: {
      params: z.object({
        id: z.string().regex(/^\d+$/).transform(Number).openapi({
          description: "Comic book ID",
          example: 1,
        }),
      }),
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: ComicBookMetadataResponseSchema,
          },
        },
        description: "Comic book metadata retrieved successfully",
      },
      404: {
        content: {
          "application/json": {
            schema: FlexibleResponseSchema,
          },
        },
        description: "Comic book not found",
      },
      500: {
        content: {
          "application/json": {
            schema: FlexibleResponseSchema,
          },
        },
        description: "Internal Server Error",
      },
    },
  }),
  async (c) => {
    const id = parseInt(c.req.param("id"), 10);
    const metadata = await fetchComicBookMetadataById(id);
    if (metadata) {
      const camelData = camelcasekeys(metadata, { deep: true });
      return c.json(camelData);
    }
    return c.json({ error: "Comic book not found" }, 404);
  });

/**
 * Download a comic book by ID
 *
 * GET /api/comic-books/{id}/download
 *
 * This should return the comic book file as a download
 * Requires authentication - only logged in users can download files
 * @param id - The ID of the comic book to download
 * @return The comic book file as a download
 *
 * TODO: TEST for large files
 */
app.openapi(
  createRoute({
    method: "get",
    path: "/{id}/download",
    summary: "Download comic book",
    description: "Download a comic book file. Requires authentication.",
    tags: ["Comic Books"],
    middleware: [requireAuth],
    request: {
      params: z.object({
        id: z.string().regex(/^\d+$/).transform(Number).openapi({
          description: "Comic book ID",
          example: 1,
        }),
      }),
    },
    responses: {
      200: {
        content: {
          "application/octet-stream": {
            schema: z.any(),
          },
        },
        description: "Comic book file downloaded successfully",
      },
      401: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Unauthorized - User must be logged in",
      },
      404: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Comic book not found",
      },
      500: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Internal Server Error",
      },
    },
  }),
  async (c) => {
    const id = Number(c.req.param("id"));

    // Verify user is authenticated (middleware checks this, but being explicit)
    const user = c.get("user");
    if (!user || !user.sub) {
      return c.json({ message: "Unauthorized - Must be logged in to download files" }, 401);
    }

    try {
      const comic: ComicBook | null = await getComicBookById(id);
      if (!comic) {
        return c.json({ message: "Comic book not found" }, 404);
      }

      const filePath = comic.filePath;
      const originalFileName = basename(filePath);

      // Sanitize filename but preserve the original extension and more characters
      // Remove only problematic characters for file systems
      const sanitizedFileName = originalFileName.replace(/[<>:"/\\|?*]/g, "_");

      // Handle comic book file types specifically
      // Force generic binary download to prevent browser interpretation
      const comicContentType = "application/octet-stream";

      const fileOpen = await Deno.open(filePath, { read: true });
      const fileSize = (await Deno.stat(filePath)).size;

      // Create a proper Response object with headers and return it
      return new Response(fileOpen.readable, {
        status: 200,
        headers: {
          "Content-Type": comicContentType,
          "Content-Disposition": `attachment; filename="${sanitizedFileName}"`,
          "Content-Length": fileSize.toString(),
          "Cache-Control": "no-cache",
          "X-Content-Type-Options": "nosniff",
        },
      });
    } catch (error) {
      console.error("Error downloading comic book:", error);
      return c.json({ message: "Failed to download comic book file" }, 500);
    }
  }
);

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
app.openapi(
  createRoute({
    method: "get",
    path: "/{id}/pages",
    summary: "Get comic book pages information",
    description: "Retrieve information about the pages of a comic book",
    tags: ["Comic Books"],
    request: {
      params: z.object({
        id: z.string().regex(/^\d+$/).transform(Number).openapi({
          description: "Comic book ID",
          example: 1,
        }),
      }),
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: FlexibleResponseSchema,
          },
        },
        description: "Comic pages information retrieved successfully",
      },
      500: {
        content: {
          "application/json": {
            schema: FlexibleResponseSchema,
          },
        },
        description: "Internal Server Error",
      },
    },
  }),
  async (c) => {
    const id = parseInt(c.req.param("id"), 10);

    try {
      const result = await getComicPagesInfo(id);
      return c.json(result);
    } catch (error) {
      console.error("Error fetching comic book pages info:", error);
      return c.json({ error: "Failed to fetch comic book pages info" }, 500);
    }
  });

/**
 * Check if a comic book has been read by a user
 *
 * GET /api/comic-books/:id/read
 *
 * This should return whether the comic book has been marked as read by the user
 */
app.openapi(
  createRoute({
    method: "get",
    path: "/{id}/read",
    summary: "Check if comic book has been read",
    description: "Check if a comic book has been marked as read by the current user",
    tags: ["Comic Books"],
    middleware: [requireAuth],
    request: {
      params: ParamIdSchema
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: ComicBookReadByUserResponseSchema,
          },
        },
        description: "Read status retrieved successfully",
      },
      400: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Bad Request",
      },
      401: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Unauthorized",
      },
      500: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Internal Server Error",
      },
    },
  }),
  async (c) => {
    const id = parseInt(c.req.param("id"), 10);

    const user = c.get("user");

    if (!user || !user.sub) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const userId = parseInt(user.sub, 10);
    if (isNaN(userId)) {
      return c.json({ message: "Invalid user ID" }, 400);
    }

    try {
      const hasRead = await checkComicReadByUser(userId, id);
      return c.json({ read: hasRead, id: id }, 200);
    } catch (error) {
      console.error("Error checking read status:", error);
      return c.json({ message: "Failed to check read status" }, 500);
    }
  }
);

/**
 * Mark a comic book as read by a user
 *
 * POST /api/comic-books/:id/read
 *
 * This should mark the comic book as read by the user
 */
app.openapi(
  createRoute({
    method: "post",
    path: "/{id}/read",
    summary: "Mark comic book as read",
    description: "Mark a comic book as read by the current user",
    tags: ["Comic Books"],
    middleware: [requireAuth],
    request: {
      params: ParamIdSchema
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: SuccessResponseSchema,
          },
        },
        description: "Comic book marked as read",
      },
      400: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Bad Request",
      },
      401: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Unauthorized",
      },
      404: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Not Found",
      },
      500: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Internal Server Error",
      },
    },
  }),
  async (c) => {
    const id = parseInt(c.req.param("id"), 10);

    const user = c.get("user");
    if (!user || !user.sub) {
      return c.json({ message: "Unauthorized - Missing or invalid user information" }, 401);
    }

    const userId = parseInt(user.sub, 10);
    if (isNaN(userId)) {
      return c.json({ message: "Invalid user ID" }, 400);
    }

    try {
      const setComicToReadSuccess = await setComicReadByUser(id, userId, true);

      if (setComicToReadSuccess) {
        return c.json({ success: true }, 200);
      } else {
        return c.json({ message: "Failed to mark comic book as read" }, 500);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      if (errorMessage.includes("FOREIGN KEY")) {
        return c.json({ message: "User or comic book not found" }, 404);
      }

      return c.json({ message: "Failed to mark comic book as read" }, 500);
    }
  }
);

/**
 * Update a comic book by ID, partial updates allowed
 *
 * PUT /api/comic-books/:id/update
 *
 * This should allow partial updates to a comic book's metadata
 */
app.openapi(
  createRoute({
    method: "put",
    path: "/{id}/update",
    summary: "Update comic book",
    description: "Update comic book metadata with partial updates allowed",
    tags: ["Comic Books"],
    request: {
      params: z.object({
        id: z.string().regex(/^\d+$/).transform(Number).openapi({
          description: "Comic book ID",
          example: 1,
        }),
      }),
      body: {
        content: {
          "application/json": {
            schema: ComicBookUpdateSchema,
          },
        },
      },
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: FlexibleResponseSchema,
          },
        },
        description: "Comic book updated successfully",
      },
      404: {
        content: {
          "application/json": {
            schema: FlexibleResponseSchema,
          },
        },
        description: "Comic book not found",
      },
      500: {
        content: {
          "application/json": {
            schema: FlexibleResponseSchema,
          },
        },
        description: "Internal Server Error",
      },
    },
  }),
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
        return c.json({ error: "Comic book not found" }, 404);
      }
    } catch (error) {
      console.error("Error updating comic book:", error);
      return c.json({ message: "Internal server error" }, 500);
    }
  });

/**
 * Delete a comic book by ID
 *
 * DELETE /api/comic-books/:id/delete
 *
 * This should delete a comic book by its ID
 */
app.openapi(
  createRoute({
    method: "delete",
    path: "/{id}/delete",
    summary: "Delete comic book",
    description: "Delete a comic book by its ID",
    tags: ["Comic Books"],
    request: {
      params: z.object({
        id: z.string().regex(/^\d+$/).transform(Number).openapi({
          description: "Comic book ID",
          example: 1,
        }),
      }),
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: FlexibleResponseSchema,
          },
        },
        description: "Comic book deleted successfully",
      },
      404: {
        content: {
          "application/json": {
            schema: FlexibleResponseSchema,
          },
        },
        description: "Comic book not found",
      },
      500: {
        content: {
          "application/json": {
            schema: FlexibleResponseSchema,
          },
        },
        description: "Internal Server Error",
      },
    },
  }),
  async (c) => {
    const id = Number(c.req.param("id"));

    try {
      const success = await deleteComicBook(id);
      if (success) {
        return c.json({
          message: `Comic book with ID ${id} deleted successfully`,
        });
      } else {
        return c.json({ error: "Comic book not found" }, 404);
      }
    } catch (error) {
      console.error("Error deleting comic book:", error);
      return c.json({ message: "Internal server error" }, 500);
    }
  });

/**
 * Get all comic books in a series
 *
 * GET /api/comic-books/series/:seriesId
 *
 * This route returns all comic book issues that belong to a given series
 */
app.openapi(
  createRoute({
    method: "get",
    path: "/series/{seriesId}",
    summary: "Get comic books by series",
    description: "Retrieve all comic book issues belonging to a specific series",
    tags: ["Comic Books"],
    request: {
      params: z.object({
        seriesId: z.string().regex(/^\d+$/).transform(Number).openapi({
          description: "Series ID",
          example: 1,
        }),
      }),
      query: PaginationQuerySchema,
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: ComicBooksResponseSchema,
          },
        },
        description: "Comic books retrieved successfully",
      },
      404: {
        content: {
          "application/json": {
            schema: FlexibleResponseSchema,
          },
        },
        description: "Series not found",
      },
      500: {
        content: {
          "application/json": {
            schema: FlexibleResponseSchema,
          },
        },
        description: "Internal Server Error",
      },
    },
  }),
  async (c) => {
    const seriesId = parseInt(c.req.param("seriesId"), 10);
    const queryData = c.req.valid("query");
    const page = queryData.page || 1;
    const pageSize = queryData.pageSize || 20;

    try {
      const comicsInSeries = await getComicBooksInSeries(seriesId);
      if (!comicsInSeries || comicsInSeries.length === 0) {
        return c.json({ message: "No comic books found for this series" }, 404);
      }

      const total = comicsInSeries.length;
      const offset = (page - 1) * pageSize;
      const pageIds = comicsInSeries.slice(offset, offset + pageSize);

      // Fetch full metadata for each comic in the page with thumbnails
      const comicsWithMetadata = await Promise.all(
        pageIds.map(async (comicId) => {
          const data = await fetchComicBookMetadataById(comicId);
          if (!data) return null;

          const camelData = camelcasekeys(data, { deep: true });
          // Attach thumbnail URL to the comic book data
          const comicWithThumbnail = await attachThumbnailToComicBook(comicId);

          return {
            ...camelData,
            thumbnailUrl: comicWithThumbnail?.thumbnailUrl || null,
          };
        }),
      );

      // Remove any null results
      const filtered = comicsWithMetadata.filter((c) => c !== null);

      return c.json({
        data: filtered,
        meta: {
          total,
          page,
          pageSize: pageSize,
          hasNextPage: offset + pageSize < total,
        },
        message: "Comic books retrieved successfully",
      }, 200);
    } catch (error) {
      console.error("Error fetching comic books in series:", error);
      return c.json({ message: "Internal server error" }, 500);
    }
  });

/**
 * Get the next comic book in the series, returning back the comic book of the next issue number
 *
 * GET /api/comic-books/:id/next
 *
 * This should return the next comic book in the same series based on the issue number
 */
app.openapi(
  createRoute({
    method: "get",
    path: "/{id}/next",
    summary: "Get next comic book in series",
    description: "Retrieve the next comic book in the same series based on issue number",
    tags: ["Comic Books"],
    request: {
      params: z.object({
        id: z.string().regex(/^\d+$/).transform(Number).openapi({
          description: "Comic book ID",
          example: 1,
        }),
      }),
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: FlexibleResponseSchema,
          },
        },
        description: "Next comic book retrieved successfully",
      },
      500: {
        content: {
          "application/json": {
            schema: FlexibleResponseSchema,
          },
        },
        description: "Internal Server Error",
      },
    },
  }),
  async (c) => {
    const id = parseInt(c.req.param("id"), 10);

    try {
      const nextComic = await getNextComicBookId(id);
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
  });

/**
 * Get the previous comic book in the series, returning back the comic book of the previous issue number
 *
 * GET /api/comic-books/:id/previous
 *
 * This should return the previous comic book in the same series based on the issue number
 */
app.openapi(
  createRoute({
    method: "get",
    path: "/{id}/previous",
    summary: "Get previous comic book in series",
    description: "Retrieve the previous comic book in the same series based on issue number",
    tags: ["Comic Books"],
    request: {
      params: z.object({
        id: z.string().regex(/^\d+$/).transform(Number).openapi({
          description: "Comic book ID",
          example: 1,
        }),
      }),
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: FlexibleResponseSchema,
          },
        },
        description: "Previous comic book retrieved successfully",
      },
      500: {
        content: {
          "application/json": {
            schema: FlexibleResponseSchema,
          },
        },
        description: "Internal Server Error",
      },
    },
  }),
  async (c) => {
    const id = parseInt(c.req.param("id"), 10);

    try {
      const previousComic = await getPreviousComicBookId(id);
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
  });

/**
 * Get all thumbnails for a comic book by ID
 *
 * GET /api/comic-books/:id/thumbnails
 *
 * This should return all thumbnails for a comic book, both generated and custom ones
 */
app.openapi(
  createRoute({
    method: "get",
    path: "/{id}/thumbnails",
    summary: "Get comic book thumbnails",
    description: "Retrieve all thumbnails for a comic book",
    tags: ["Comic Books"],
    middleware: [requireAuth],
    request: {
      params: ParamIdSchema
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: ComicBookThumbnailsResponseSchema,
          },
        },
        description: "Thumbnails retrieved successfully",
      },
      404: {
        content: {
          "application/json": {
            schema: FlexibleResponseSchema,
          },
        },
        description: "No thumbnails found for this comic book",
      },
      500: {
        content: {
          "application/json": {
            schema: FlexibleResponseSchema,
          },
        },
        description: "Internal Server Error",
      },
    },
  }),
  async (c) => {
    const id: number = parseInt(c.req.param("id"), 10);

    try {
      const thumbnails: ComicBookThumbnail[] | null = await getComicThumbnails(id);
      if (thumbnails) {
        return c.json({
          thumbnails: thumbnails,
          message: "Fetched comic book thumbnails successfully",
        }, 200);
      } else {
        return c.json({
          message: "No thumbnails found for this comic book",
        }, 404);
      }
    } catch (error) {
      console.error("Error fetching comic book thumbnails:", error);
      return c.json({ error: "Failed to fetch comic book thumbnails" }, 500);
    }
  }
);

/**
 * Get a specific thumbnail for a comic book by ID and thumbnail ID
 *
 * GET /api/comic-books/:id/thumbnails/:thumbId
 *
 * This should return a specific thumbnail for a comic book by its ID and the thumbnail ID
 */
app.openapi(
  createRoute({
    method: "get",
    path: "/{id}/thumbnails/{thumbId}",
    summary: "Get specific comic thumbnail",
    description: "Retrieve a specific thumbnail for a comic book",
    tags: ["Comic Books"],
    request: {
      params: z.object({
        id: z.string().regex(/^\d+$/).transform(Number).openapi({
          description: "Comic book ID",
          example: 1,
        }),
        thumbId: z.string().regex(/^\d+$/).transform(Number).openapi({
          description: "Thumbnail ID",
          example: 1,
        }),
      }),
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: FlexibleResponseSchema,
          },
        },
        description: "Thumbnail retrieved successfully",
      },
      404: {
        content: {
          "application/json": {
            schema: FlexibleResponseSchema,
          },
        },
        description: "Thumbnail not found",
      },
      500: {
        content: {
          "application/json": {
            schema: FlexibleResponseSchema,
          },
        },
        description: "Internal Server Error",
      },
    },
  }),
  async (c) => {
    const id = parseInt(c.req.param("id"), 10);
    const thumbId = parseInt(c.req.param("thumbId"), 10);

    try {
      const thumbnail = await getComicThumbnailByComicIdThumbnailId(id, thumbId);
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
app.openapi(
  createRoute({
    method: "delete",
    path: "/{id}/thumbnails/{thumbId}",
    summary: "Delete comic thumbnail",
    description: "Delete a specific thumbnail for a comic book",
    tags: ["Comic Books"],
    request: {
      params: z.object({
        id: z.string().regex(/^\d+$/).transform(Number).openapi({
          description: "Comic book ID",
          example: 1,
        }),
        thumbId: z.string().regex(/^\d+$/).transform(Number).openapi({
          description: "Thumbnail ID",
          example: 1,
        }),
      }),
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: FlexibleResponseSchema,
          },
        },
        description: "Thumbnail deleted successfully",
      },
      500: {
        content: {
          "application/json": {
            schema: FlexibleResponseSchema,
          },
        },
        description: "Internal Server Error",
      },
    },
  }),
  async (c) => {
    const id = parseInt(c.req.param("id"), 10);
    const thumbId = parseInt(c.req.param("thumbId"), 10);

    try {
      await deleteComicsThumbnailById(id, thumbId);
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
app.openapi(
  createRoute({
    method: "post",
    path: "/{id}/thumbnails",
    summary: "Create custom thumbnail",
    description: "Create a custom thumbnail for a comic book via multipart form data",
    tags: ["Comic Books"],
    request: {
      params: z.object({
        id: z.string().regex(/^\d+$/).transform(Number).openapi({
          description: "Comic book ID",
          example: 1,
        }),
      }),
    },
    responses: {
      201: {
        content: {
          "application/json": {
            schema: FlexibleResponseSchema,
          },
        },
        description: "Custom thumbnail created successfully",
      },
      400: {
        content: {
          "application/json": {
            schema: FlexibleResponseSchema,
          },
        },
        description: "Bad request - invalid input",
      },
      404: {
        content: {
          "application/json": {
            schema: FlexibleResponseSchema,
          },
        },
        description: "Comic book not found",
      },
      500: {
        content: {
          "application/json": {
            schema: FlexibleResponseSchema,
          },
        },
        description: "Internal Server Error",
      },
    },
  }),
  async (c) => {
    const comicId = parseInt(c.req.param("id"), 10);

    if (isNaN(comicId)) {
      return c.json({ error: "Invalid comic book ID" }, 400);
    }

    try {
      // TODO: Implement proper auth check
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
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
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
  });

/**
 * Get readlists for a comic book
 *
 * GET /api/comic-books/:id/readlists
 *
 * This should return the readlists that contain this comic book
 */
app.openapi(
  createRoute({
    method: "get",
    path: "/{id}/readlists",
    summary: "Get comic book readlists",
    description: "Retrieve readlists that contain this comic book",
    tags: ["Comic Books"],
    request: {
      params: z.object({
        id: z.string().regex(/^\d+$/).transform(Number).openapi({
          description: "Comic book ID",
          example: 1,
        }),
      }),
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: FlexibleResponseSchema,
          },
        },
        description: "Readlists retrieved",
      },
      501: {
        content: {
          "application/json": {
            schema: FlexibleResponseSchema,
          },
        },
        description: "Not yet implemented",
      },
    },
  }),
  (c) => {
    // TODO: implement comic book readlists retrieval logic
    return c.json({
      message: "Comic book readlists retrieval not implemented yet",
    }, 501);
  });

export default app;
