import { z } from "@hono/zod-openapi";

import { 
  AuthRefreshToken,
  AuthAccessToken
} from "./data/auth.schema.ts";
import { 
  ComicStoryArcSelectSchema, 
  ComicBookThumbnailSelectSchema, 
  ComicPageSelectSchema 
} from "./data/database.schema.ts";
import { ComicBookSchema } from "./data/comicBooks.schema.ts";
import { ComicSeriesSchema } from "./data/comicSeries.schema.ts";

// **** Basic response schemas **** //
/**
 * Schema for a simple message response
 */
export const MessageResponseSchema = z.object({
  message: z.string(),
}).openapi({
  title: "MessageResponse",
  description: "A response containing a message string",
});

/**
 * Schema for an error response with optional details
 */
export const ErrorResponseSchema = z.object({
  message: z.string(),
  errors: z.record(z.string(), z.any().openapi({ type: "object" })).optional(),
}).openapi({
  title: "ErrorResponse",
  description: "A response indicating an error with optional error details",
});

/**
 * Schema for a success response
 */
export const SuccessResponseSchema = z.object({
  success: z.boolean(),
}).openapi({
  title: "SuccessResponse",
  description: "A response indicating success or failure",
});

/**
 * 
 */
export const SuccessCreationResponseSchema = z.object({
  success: z.boolean(),
  id: z.number().optional(),
}).openapi({
  title: "SuccessCreationResponse",
  description: "A response indicating success of a creation operation, optionally including the ID of the created resource",
});

// **** Modular schemas **** //

/**
 * Schema for pagination metadata in responses
 */
const PaginationMetaSchema = z.object({
  count: z.number().min(0).default(0),
  hasNextPage: z.boolean().default(false),
  currentPage: z.number().min(1).default(1),
  pageSize: z.number().min(1).default(1),
}).openapi({
  title: "PaginationMeta",
  description: "Metadata for paginated responses",
});

/**
 * Schema for filter metadata in responses
 */
const FilterMetaSchema = z.object({
  filterProperty: z.string().optional(),
  filterValue: z.string().optional(),
}).openapi({
  title: "FilterMeta",
  description: "Metadata for filtered responses",
});

/**
 * Schema for sort metadata in responses
 */
const SortMetaSchema = z.object({
  sortProperty: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
}).openapi({
  title: "SortMeta",
  description: "Metadata for sorted responses",
});

/**
 * Schema for update results in bulk update responses
 */
const UpdatedResultsSchema = z.object({
  totalUpdated: z.number().min(0).default(0),
  totalRequested: z.number().min(0).default(0),
  successful: z.boolean().default(false),
}).openapi({
  title: "UpdatedResults",
  description: "Information about the results of an update operation",
});

const BasicUserInfoSchema = z.object({
  id: z.number(),
  email: z.email(),
  admin: z.boolean().default(false),
}).openapi({
  title: "BasicUserInfo",
  description: "Basic information about a user",
});

// **** Full response schemas **** //

/**
 * Schema for paginated comic series response
 */
export const ComicSeriesResponseSchema = z.object({
  data: z.array(ComicSeriesSchema),
  meta: z.object(PaginationMetaSchema.shape).extend(FilterMetaSchema.shape).extend(SortMetaSchema.shape),
}).openapi({
  title: "ComicSeriesResponse",
  description: "Response containing paginated comic series data",
});

/**
 * Schema for returning multiple comic books as part of a response
 */
export const ComicBookMultipleResponseSchema = z.object({
  data: z.array(ComicBookSchema),
  meta: z.object(PaginationMetaSchema.shape).extend(FilterMetaSchema.shape).extend(SortMetaSchema.shape),
}).openapi({
  title: "ComicBookMultipleResponse",
  description: "Response containing multiple comic books",
});

/**
 * Schema for returning multiple comic story arcs as part of a response
 */
export const ComicStoryArcMultipleResponseSchema = z.object({
  data: z.array(ComicStoryArcSelectSchema),
  meta: z.object(PaginationMetaSchema.shape).extend(FilterMetaSchema.shape).extend(SortMetaSchema.shape),
}).openapi({
  title: "ComicStoryArcMultipleResponse",
  description: "Response containing multiple comic story arcs",
});

/**
 * Schema for comic book readlists response associated with a specific comic book
 */
export const ComicBookReadListsResponseSchema = z.object({
  comicId: z.number(),
  readLists: z.array(ComicStoryArcSelectSchema),
}).openapi({
  title: "ComicBookReadListsResponse",
  description: "Response containing readlists that include a specific comic book",
});

/**
 * Schema for a comic book's thumbnails as part of a response
 */
export const ComicBookThumbnailsResponseSchema = z.object({
  thumbnails: z.array(ComicBookThumbnailSelectSchema),
  message: z.string(),
}).openapi({
  title: "ComicBookThumbnailsResponse",
  description: "Response containing an array of comic book thumbnails",
});

/**
 * Schema for comic book read by user response
 */
export const ComicBookReadByUserResponseSchema = z.object({
  id: z.number(),
  read: z.boolean(),
}).openapi({
  title: "ComicBookReadByUserResponse",
  description: "Response indicating if a comic book has been read by the user",
});

/**
 * Schema for bulk update response with results summary including total updated, total requested, and success status
 */
export const BulkUpdateResponseSchema = MessageResponseSchema.extend(UpdatedResultsSchema.shape).openapi({
  title: "BulkUpdateResponse",
  description: "Response for bulk update operations with results summary",
});

/**
 * Schema for file download response metadata
 * Represents the headers and metadata sent with a file download response
 */
export const FileDownloadResponseSchema = z.object({
  fileName: z.string().openapi({
    description: "The name of the file being downloaded",
    example: "comic_book.cbz"
  }),
  contentType: z.string().openapi({
    description: "The MIME type of the file",
    example: "application/octet-stream"
  }),
  contentLength: z.number().openapi({
    description: "The size of the file in bytes",
    example: 5242880
  }),
}).openapi({
  title: "FileDownloadResponse",
  description: "Response metadata for file downloads containing file information and headers",
});

/**
 * Schema for comic book streaming response
 * Represents a single page being streamed during a reading session
 */
export const ComicBookStreamingResponseSchema = z.object({
  comicId: z.number().openapi({
    description: "The ID of the comic book being streamed",
    example: 1
  }),
  pagePath: z.string().openapi({
    description: "The file path to the current page image",
    example: "/path/to/page/image.png"
  }),
  pageNumber: z.number().openapi({
    description: "The current page number being streamed",
    example: 1
  }),
  format: z.string().openapi({
    description: "The image format of the page",
    example: "image/png"
  }),
  cached: z.boolean().openapi({
    description: "Whether the page is cached locally",
    example: true
  }),
}).openapi({
  title: "ComicBookStreamingResponse",
  description: "Response containing a single page of a comic book stream",
});

/**
 * Schema for comic book pages info response
 */
export const ComicBookPagesInfoResponseSchema = z.object({
  comicId: z.number().openapi({
    description: "The ID of the comic book",
    example: 1
  }),
  totalPages: z.number().openapi({
    description: "The total number of pages in the comic book",
    example: 100
  }),
  pagesInDb: z.number().openapi({
    description: "The number of pages currently stored in the database",
    example: 80
  }),
  pages: z.array(ComicPageSelectSchema).openapi({
    description: "An array of comic pages",
  }),
}).openapi({
  title: "ComicBookPagesInfoResponse",
  description: "Response containing information about comic book pages",
});

/**
 * Schema for login response containing user info and tokens
 */
export const LoginResponseSchema = z.object({
  message: z.string().openapi({ example: "Login successful" }),
  user: BasicUserInfoSchema,
  accessToken: AuthAccessToken,
  refreshToken: AuthRefreshToken,
}).openapi({
  title: "LoginResponse",
  description: "Response for successful login containing user info and tokens",
});

/**
 * Schema for refresh token response containing new access and refresh tokens
 */
export const RefreshTokenResponseSchema = z.object({
  message: z.string().openapi({ example: "Token refreshed successfully" }),
  accessToken: AuthAccessToken,
  refreshToken: AuthRefreshToken,
}).openapi({
  title: "RefreshTokenResponse",
  description: "Response for successful token refresh containing new tokens",
});

/**
 * Schema for logout response indicating successful logout
 */
export const LogoutAllResponseSchema = z.object({
  message: z.string().openapi({
    example: "Logged out from all devices successfully",
  }),
  revokedTokens: z.number().openapi({ example: 3 }),
}).openapi({
  title: "LogoutAllResponse",
  description: "Response for logging out from all devices, including the number of revoked tokens",
});

/**
 * Schema for image file response
 * Represents binary image data (JPEG, PNG, WebP)
 */
export const ImageResponseSchema = z.any().openapi({
  title: "ImageResponse",
  description: "Binary image file response (JPEG, PNG, or WebP format)",
  type: "string",
  format: "binary",
});

/**
 * Schema for readlists response containing an array of readlists
 * Each readlist has an id and name
 */
export const ReadlistsResponseSchema = z.array(z.object({
  id: z.number().openapi({
    example: 1,
  }),
  name: z.string().openapi({
    example: "My Readlist",
  }),
})).openapi({
  title: "ReadlistsResponse",
  description: "Array of readlists with id and name",
});

/**
 * Schema for user creation response containing a success message and the new user's ID
 */
export const UserCreationResponseSchema = z.object({
  message: z.string(),
  userId: z.number(),
}).openapi({
  title: "UserCreationResponse",
  description: "Response for successful user creation containing a message and the new user's ID",
});