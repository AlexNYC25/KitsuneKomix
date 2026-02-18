import { QueryableColumns } from "../constants/index.ts";

import type { ComicSeries } from "#types/database.types.ts";

import type { ComicSeriesSortField } from "#types/parameters.type.ts";

import type { ComicBookMetadataOnly } from "#types/comicBook.type.ts";

export type AllowedComicSeriesSortFilterProperties =
  keyof typeof QueryableColumns["comicSeries"]["filter"];

export type AllowedComicSeriesSortProperties =
  keyof typeof QueryableColumns["comicSeries"]["sort"];

export type ComicSeriesFilterItem = {
  filterProperty: AllowedComicSeriesSortFilterProperties;
  filterValue: string;
};

export type ComicSeriesFilteringAndSortingParams = {
  filters?: ComicSeriesFilterItem[];
  sort?: {
    property: ComicSeriesSortField;
    order: "asc" | "desc";
  };
  offset?: number;
  limit?: number;
};

export type ComicSeriesMetadata = {
  totalComicBooks: number;
  totalSize: number; // in bytes
  thumbnailUrl?: string;
  credits: ComicBookMetadataOnly;
};

export type ComicSeriesWithMetadata = ComicSeries & ComicSeriesMetadata;
