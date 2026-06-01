import type { z } from "zod";

import type { 
  ComicBookWithMetadataSchema, 
  ComicBookCreatorContentSchema,
  ComicBookLevelMetadataSchema,
  ComicBookFilterValuesSchema,
  ComicBookReadingHistorySchema
} from "#zod/schemas/data/comicBooks.schema.ts";

import type { ComicFilterField, ComicSortField } from "./parameters.type.ts";

export type AllowedFilterProperties = ComicFilterField;

export type AllowedSortProperties = ComicSortField;

export type ComicBookHistoryOnly = z.infer<typeof ComicBookReadingHistorySchema>;

export type ComicBookMetadataOnly = z.infer<typeof ComicBookCreatorContentSchema>;

export type ComicBookLevelMetadata = z.infer<typeof ComicBookLevelMetadataSchema>;

export type ComicBooksFilterValues = z.infer<typeof ComicBookFilterValuesSchema>;

export type ComicBookWithMetadata = z.infer<typeof ComicBookWithMetadataSchema>;

// Filter types for advanced comic book querying
export type ComicBookFilterItem = {
  filterProperty: AllowedFilterProperties;
  filterValue: string;
};

// Service function parameter types
export type ComicBookFilteringAndSortingParams = {
  filters?: ComicBookFilterItem[];
  sort?: {
    property: ComicSortField;
    order: "asc" | "desc";
  };
  offset?: number;
  limit?: number;
};

export type ComicBookStreamingServiceData = {
  comicId: number;
  pageNumber: number;
  acceptHeader: string | null;
  preloadPagesNumber: number;
};

export type ComicBookStreamingServiceResult = {
  comicId: number;
  pagePath: string;
  pageNumber: number;
  format: string;
  cached: boolean;
};

/**
 * Type representing the an internal structure of data
 * when processing comic metadata
 */
export type MetadataProcessor = {
	label: string;
	values?: string[];
	insert: (name: string) => Promise<number>;
	link: (entityId: number, comicId: number) => Promise<void>;
};