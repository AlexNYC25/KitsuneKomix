// Re-export all database types
export * from "./database.types.ts";

// Re-export specific domain types
export * from "./user.type.ts";
export * from "./comicLibrary.type.ts";
export * from "./comicBook.type.ts";
export * from "./comicSeries.type.ts";
export * from "./appSetting.type.ts";
export * from "./comicCreator.type.ts";
export * from "./comicBookRelation.type.ts";

// Re-export transformers
export * from "./transformers.ts";

// Common utility types
export type PaginationParams = {
  page?: number;
  limit?: number;
  offset?: number;
};

export type SortParams = {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export type SearchResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
};

export type ApiError = {
  success: false;
  error: string;
  statusCode?: number;
};
