import type { z } from "zod";

import type { QueryableColumns } from "#infrastructure/db/sqlite/queryableColumns.ts";

import type { ComicSeriesSchema, ComicSeriesMetaData } from "#zod/schemas/data/comicSeries.schema.ts";

import type { ComicSeriesSortField } from "#types/parameters.type.ts";

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

export type ComicSeriesMetadata = z.infer<typeof ComicSeriesMetaData>;

export type ComicSeriesWithMetadata = z.infer<typeof ComicSeriesSchema>;
