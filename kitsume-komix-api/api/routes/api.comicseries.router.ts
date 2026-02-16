import { createRoute, OpenAPIHono } from "@hono/zod-openapi";

import { requireAuth } from "../middleware/authChecks.ts";

import {
  fetchComicSeries,
} from "../services/comicSeries.service.ts";


import { 
  AuthHeaderSchema 
} from "#schemas/header.schema.ts";
import {
  ParamIdThumbnailIdSchema,
  PaginationSortFilterQuerySchema,
  ParamIdSchema,
  PaginationLetterQuerySchema,
} from "#schemas/request.schema.ts";
import {
  ComicSeriesMultipleResponseSchema,
  MessageResponseSchema,
  ErrorResponseSchema,
} from "#schemas/response.schema.ts";

import type { 
  AppEnv,
  AccessRefreshTokenCombinedPayload,
  QueryData,
  RequestParametersValidated,
  ComicSeriesSortField,
  ComicSeriesFilterField,
  ComicSeriesWithMetadata,
  RequestSortParametersValidated,
  RequestFilterParametersValidated,
  RequestPaginationParametersValidated,
  ComicSeriesMultipleResponseData,
  ComicSeriesMultipleResponseMeta,
  ComicSeriesMultipleResponse,
  QueryDataWithLetter
} from "#types/index.ts";

import { validateAndBuildQueryParams, validatePagination } from "#utilities/parameters.ts";

const app = new OpenAPIHono<AppEnv>();

app.openAPIRegistry.registerComponent("securitySchemes", "Bearer", {
  type: "http",
  scheme: "bearer",
});

/**
 * GET /api/comic-series/
 *
 * Basic route to get all comic series.
 */
app.openapi(
  createRoute({
    method: "get",
    path: "/",
    summary: "Get all comic series",
    description: "Retrieve all comic series from the database",
    tags: ["Comic Series"],
    middleware: [requireAuth],
    request: {
      query: PaginationSortFilterQuerySchema,
    },
    responses: {
      200: {
        content: { 
          "application/json": { 
            schema: ComicSeriesMultipleResponseSchema,
          }
        },
        description: "Series retrieved successfully",
      },
      400: {
        content: { 
          "application/json": { 
            schema: MessageResponseSchema 
          }
        },
        description: "Bad Request",
      },
      401: {
        content: { 
          "application/json": { 
            schema: MessageResponseSchema 
          }
        },
        description: "Unauthorized",
      },
      500: {
        content: { 
          "application/json": 
            { 
              schema: MessageResponseSchema 
            } 
        },
        description: "Internal Server Error",
      },
    },
  }),
  async (c) => {
    const queryData: QueryData = c.req.valid("query");

    const user: AccessRefreshTokenCombinedPayload | undefined = c.get("user");

    if (!user || !user.sub) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const userId: number = parseInt(user.sub, 10);
    if (isNaN(userId)) {
      return c.json({ message: "Invalid user ID" }, 400);
    }

    const serviceData: RequestParametersValidated<ComicSeriesSortField, ComicSeriesFilterField> = validateAndBuildQueryParams(queryData, "comicSeries");

    try {
      const comicSeries: ComicSeriesWithMetadata[] = await fetchComicSeries(serviceData);

      const serviceDataPagination: RequestPaginationParametersValidated = serviceData.pagination;
      const serviceDataFilter: RequestFilterParametersValidated<ComicSeriesFilterField> | undefined = serviceData.filter;
      const serviceDataSort: RequestSortParametersValidated<ComicSeriesSortField> = serviceData.sort;

      const hasNextPage: boolean = comicSeries.length > serviceDataPagination.pageSize;
      const resultComicSeries: ComicSeriesMultipleResponseData = hasNextPage ? comicSeries.slice(0, serviceDataPagination.pageSize) : comicSeries;

      const requestMetadata: ComicSeriesMultipleResponseMeta = {
        count: resultComicSeries.length,
        hasNextPage: hasNextPage,
        currentPage: serviceDataPagination.pageNumber,
        pageSize: serviceDataPagination.pageSize,
        filterProperty: serviceDataFilter?.filterProperty,
        filterValue: serviceDataFilter?.filterValue,
        sortProperty: serviceDataSort.sortProperty,
        sortOrder: serviceDataSort.sortOrder,
      }

      const returnObj: ComicSeriesMultipleResponse = {
        data: resultComicSeries,
        meta: requestMetadata,
      };

      return c.json(returnObj, 200);
    } catch (error) {
      console.error("Error fetching comic series:", error);
      return c.json({ message: "Internal Server Error" }, 500);
    }
  },
);

/**
 * GET /api/comic-series/latest
 *
 * Get the latest comic series that the current user has access to.
 * Admins can see all series, regular users only those they have been granted access to.
 * Results are always sorted by creation date in descending order.
 */
app.openapi(
  createRoute({
    method: "get",
    path: "/latest",
    summary: "Get latest comic series",
    tags: ["Comic Series"],
    middleware: [requireAuth],
    request: { 
      headers: AuthHeaderSchema, 
      query: PaginationSortFilterQuerySchema 
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: ComicSeriesMultipleResponseSchema,
          },
        },
        description: "Latest series retrieved successfully",
      },
      400: {
        content: { "application/json": { schema: MessageResponseSchema } },
        description: "Bad Request",
      },
      401: {
        content: { "application/json": { schema: MessageResponseSchema } },
        description: "Unauthorized",
      },
      500: {
        content: { "application/json": { schema: MessageResponseSchema } },
        description: "Internal Server Error",
      },
    },
  }),
  async (c) => {
    const user: AccessRefreshTokenCombinedPayload | undefined = c.get("user");
    if (!user || !user.sub) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const userId: number = parseInt(user.sub, 10);
    if (isNaN(userId)) {
      return c.json({ message: "Invalid user ID" }, 400);
    }

    const queryData: QueryData = c.req.valid("query");

    // Override sort to always be by createdAt in descending order
    queryData.sort = "createdAt";
    queryData.sortDirection = "desc";

    const serviceData: RequestParametersValidated<ComicSeriesSortField, ComicSeriesFilterField> = validateAndBuildQueryParams(queryData, "comicSeries");

    try {
      const comicSeries: ComicSeriesWithMetadata[] = await fetchComicSeries(serviceData);

      const serviceDataPagination: RequestPaginationParametersValidated = serviceData.pagination;
      const serviceDataFilter: RequestFilterParametersValidated<ComicSeriesFilterField> | undefined = serviceData.filter;
      const serviceDataSort: RequestSortParametersValidated<ComicSeriesSortField> = serviceData.sort;

      const hasNextPage: boolean = comicSeries.length > serviceDataPagination.pageSize;
      const resultComicSeries: ComicSeriesMultipleResponseData = hasNextPage ? comicSeries.slice(0, serviceDataPagination.pageSize) : comicSeries;

      const requestMetadata: ComicSeriesMultipleResponseMeta = {
        count: resultComicSeries.length,
        hasNextPage: hasNextPage,
        currentPage: serviceDataPagination.pageNumber,
        pageSize: serviceDataPagination.pageSize,
        filterProperty: serviceDataFilter?.filterProperty,
        filterValue: serviceDataFilter?.filterValue,
        sortProperty: serviceDataSort.sortProperty,
        sortOrder: serviceDataSort.sortOrder,
      }

      const returnObj: ComicSeriesMultipleResponse = {
        data: resultComicSeries,
        meta: requestMetadata,
      };

      return c.json(returnObj, 200);
    } catch (error) {
      console.error("Error fetching latest comic series:", error);
      return c.json({ message: "Internal Server Error" }, 500);
    }
  },
);

/**
 * GET /api/comic-series/updated
 */
app.openapi(
  createRoute({
    method: "get",
    path: "/updated",
    summary: "Get updated comic series",
    tags: ["Comic Series"],
    middleware: [requireAuth],
    request: { headers: AuthHeaderSchema, query: PaginationSortFilterQuerySchema },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: ComicSeriesMultipleResponseSchema,
          },
        },
        description: "Updated series retrieved successfully",
      },
      400: {
        content: { "application/json": { schema: MessageResponseSchema } },
        description: "Bad Request",
      },
      401: {
        content: { "application/json": { schema: MessageResponseSchema } },
        description: "Unauthorized",
      },
      500: {
        content: { "application/json": { schema: MessageResponseSchema } },
        description: "Internal Server Error",
      },
    },
  }),
  async (c) => {
    const user: AccessRefreshTokenCombinedPayload | undefined = c.get("user");
    if (!user || !user.sub) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const userId: number = parseInt(user.sub, 10);
    if (isNaN(userId)) {
      return c.json({ message: "Invalid user ID" }, 400);
    }

    const queryData: QueryData = c.req.valid("query");

    // Override sort to always be by updatedAt in descending order
    queryData.sort = "updatedAt";
    queryData.sortDirection = "desc";

    const serviceData: RequestParametersValidated<ComicSeriesSortField, ComicSeriesFilterField> = validateAndBuildQueryParams(queryData, "comicSeries");

    try {
      const comicSeries: ComicSeriesWithMetadata[] = await fetchComicSeries(serviceData);

      const serviceDataPagination: RequestPaginationParametersValidated = serviceData.pagination;
      const serviceDataFilter: RequestFilterParametersValidated<ComicSeriesFilterField> | undefined = serviceData.filter;
      const serviceDataSort: RequestSortParametersValidated<ComicSeriesSortField> = serviceData.sort;

      const hasNextPage: boolean = comicSeries.length > serviceDataPagination.pageSize;
      const resultComicSeries: ComicSeriesMultipleResponseData = hasNextPage ? comicSeries.slice(0, serviceDataPagination.pageSize) : comicSeries;

      const requestMetadata: ComicSeriesMultipleResponseMeta = {
        count: resultComicSeries.length,
        hasNextPage: hasNextPage,
        currentPage: serviceDataPagination.pageNumber,
        pageSize: serviceDataPagination.pageSize,
        filterProperty: serviceDataFilter?.filterProperty,
        filterValue: serviceDataFilter?.filterValue,
        sortProperty: serviceDataSort.sortProperty,
        sortOrder: serviceDataSort.sortOrder,
      }

      const returnObj: ComicSeriesMultipleResponse = {
        data: resultComicSeries,
        meta: requestMetadata,
      };

      return c.json(returnObj, 200);
    } catch (error) {
      console.error("Error fetching updated comic series:", error);
      return c.json({ message: "Internal Server Error" }, 500);
    }
  },
);

/**
 * GET /api/comic-series/{id}
 *
 * Get a comic series by ID.
 */
app.openapi(
  createRoute({
    method: "get",
    path: "/{id}",
    summary: "Get a comic series by ID",
    tags: ["Comic Series"],
    middleware: [requireAuth],
    request: { 
      params: ParamIdSchema,
      query: PaginationSortFilterQuerySchema,
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: ComicSeriesMultipleResponseSchema,
          },
        },
        description: "Series retrieved successfully",
      },
      400: {
        content: { "application/json": { schema: MessageResponseSchema } },
        description: "Bad Request",
      },
      401: {
        content: { "application/json": { schema: MessageResponseSchema } },
        description: "Unauthorized",
      },
      404: {
        content: { "application/json": { schema: MessageResponseSchema } },
        description: "Not Found",
      },
      500: {
        content: { "application/json": { schema: MessageResponseSchema } },
        description: "Internal Server Error",
      },
    },
  }),
  async (c) => {
    const user: AccessRefreshTokenCombinedPayload | undefined = c.get("user");
    if (!user || !user.sub) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const userId: number = parseInt(user.sub, 10);
    if (isNaN(userId)) {
      return c.json({ message: "Invalid user ID" }, 400);
    }

    const { id } = c.req.valid("param");
    if (!id) {
      return c.json({ message: "Invalid series ID" }, 400);
    }

    const queryData: QueryData = c.req.valid("query");

    // Override to filter by ID, sort by ID, and limit to 1 result
    queryData.filter = id;
    queryData.filterProperty = "id";
    queryData.sort = "id";
    queryData.sortDirection = "asc";
    queryData.pageSize = 1;

    const serviceData: RequestParametersValidated<ComicSeriesSortField, ComicSeriesFilterField> = validateAndBuildQueryParams(queryData, "comicSeries");

    try {
      const comicSeries: ComicSeriesWithMetadata[] = await fetchComicSeries(serviceData);
      if (!comicSeries || comicSeries.length === 0) {
        return c.json({ message: "Comic series not found" }, 404);
      }

      const serviceDataPagination: RequestPaginationParametersValidated = serviceData.pagination;
      const serviceDataFilter: RequestFilterParametersValidated<ComicSeriesFilterField> | undefined = serviceData.filter;
      const serviceDataSort: RequestSortParametersValidated<ComicSeriesSortField> = serviceData.sort;

      const requestMetadata: ComicSeriesMultipleResponseMeta = {
        count: 1,
        hasNextPage: false,
        currentPage: serviceDataPagination.pageNumber,
        pageSize: serviceDataPagination.pageSize,
        filterProperty: serviceDataFilter?.filterProperty,
        filterValue: serviceDataFilter?.filterValue,
        sortProperty: serviceDataSort.sortProperty,
        sortOrder: serviceDataSort.sortOrder,
      }

      const returnObj: ComicSeriesMultipleResponse = {
        data: [comicSeries[0]],
        meta: requestMetadata,
      };

      return c.json(returnObj, 200);
    } catch (error) {
      console.error("Error fetching comic series:", error);
      return c.json({ message: "Internal Server Error" }, 500);
    }
  },
);

/**
 * GET /api/comic-series/list
 * Get comic series by starting letter. This is used for the alphabetical listing on the frontend.
 */
app.openapi(
  createRoute({
    method: "get",
    path: "/list",
    summary: "Get series by letter",
    tags: ["Comic Series"],
    request: {
      query: PaginationLetterQuerySchema,
    },
    responses: {
      200: {
        content: { 
          "application/json": { 
            schema: ComicSeriesMultipleResponseSchema 
          } 
        },
        description: "Alphabetical series retrieved successfully",
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
    const queryData: QueryDataWithLetter = c.req.valid("query");

    queryData.sort = "title";
    queryData.sortDirection = "asc";
    queryData.filter = queryData.letter;
    queryData.filterProperty = "listLetter";

    const user: AccessRefreshTokenCombinedPayload | undefined = c.get("user");
    
    if (!user || !user.sub) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const userId: number = parseInt(user.sub, 10);
    if (isNaN(userId)) {
      return c.json({ message: "Invalid user ID" }, 400);
    }

    const serviceData: RequestParametersValidated<ComicSeriesSortField, ComicSeriesFilterField> = validateAndBuildQueryParams(queryData, "comicSeries");
    const paginationData: RequestPaginationParametersValidated = validatePagination(queryData.page, queryData.pageSize);

    try {
      const comicSeries: ComicSeriesWithMetadata[] = await fetchComicSeries(serviceData);

      const hasNextPage: boolean = comicSeries.length > paginationData.pageSize;
      const resultComics: ComicSeriesWithMetadata[] = hasNextPage ? comicSeries.slice(0, paginationData.pageSize) : comicSeries;

      const requestMetadata: ComicSeriesMultipleResponseMeta = {
        count: resultComics.length,
        hasNextPage: hasNextPage,
        currentPage: paginationData.pageNumber,
        pageSize: paginationData.pageSize,
      }

      const returnObj: ComicSeriesMultipleResponse = {
        data: resultComics,
        meta: requestMetadata,
      };

      return c.json(returnObj, 200);
    } catch (error) {
      console.error("Error fetching comic series:", error);
      return c.json({ message: "Internal Server Error" }, 500);
    }
  }
);


// -- Up to this point, we have updated the routes

// Get series thumbnails
app.openapi(
  createRoute({
    method: "get",
    path: "/{id}/thumbnails",
    summary: "Get series thumbnails",
    tags: ["Comic Series"],
    request: { params: ParamIdSchema },
    responses: {
      200: {
        content: { "application/json": { schema: MessageResponseSchema } },
        description: "Thumbnails retrieved successfully",
      },
    },
  }),
  (c) => {
    const { id } = c.req.valid("param");
    return c.json({
      message: `Comic Series API is running for ID ${id} - Thumbnails`,
    }, 200);
  }
);

// Delete series thumbnail
app.openapi(
  createRoute({
    method: "delete",
    path: "/{id}/thumbnail/{thumbId}",
    summary: "Delete series thumbnail",
    tags: ["Comic Series"],
    request: { params: ParamIdThumbnailIdSchema },
    responses: {
      200: {
        content: { "application/json": { schema: MessageResponseSchema } },
        description: "Thumbnail deleted successfully",
      },
    },
  }),
  (c) => {
    const { id } = c.req.valid("param");
    return c.json({
      message: `Comic Series API is running for ID ${id} - Thumbnail Deletion`,
    }, 200);
  }
);

// Get specific thumbnail
app.openapi(
  createRoute({
    method: "get",
    path: "/{id}/thumbnails/{thumbId}",
    summary: "Get specific thumbnail",
    tags: ["Comic Series"],
    request: { params: ParamIdThumbnailIdSchema },
    responses: {
      200: {
        content: { "application/json": { schema: MessageResponseSchema } },
        description: "Thumbnail retrieved successfully",
      },
    },
  }),
  (c) => {
    const { id } = c.req.valid("param");
    return c.json({
      message: `Comic Series API is running for ID ${id} - Thumbnail Retrieval`,
    }, 200);
  }
);

// Update thumbnail cover
app.openapi(
  createRoute({
    method: "put",
    path: "/{id}/thumbnail/{thumbId}/cover",
    summary: "Update thumbnail cover",
    tags: ["Comic Series"],
    request: { params: ParamIdThumbnailIdSchema },
    responses: {
      200: {
        content: { "application/json": { schema: MessageResponseSchema } },
        description: "Thumbnail cover updated successfully",
      },
    },
  }),
  (c) => {
    const { id } = c.req.valid("param");
    return c.json({
      message:
        `Comic Series API is running for ID ${id} - Thumbnail Cover Update`,
    }, 200);
  }
);



export default app;
