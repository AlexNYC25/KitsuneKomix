import type {
  QueryableDomain,
  QueryableFilterField,
  QueryableSortField,
} from "#zod/schemas/data/queryableColumns.schema.ts";

/**
 * Type helpers to extract sort and filter field types from the canonical
 * queryable domain config for any data type (comics, series, readlists, etc.)
 */
export type ExtractSortField<T extends QueryableDomain> = QueryableSortField<T>;

export type ExtractFilterField<T extends QueryableDomain> = QueryableFilterField<T>;

export type ComicSortField = ExtractSortField<"comics">;
export type ComicFilterField = ExtractFilterField<"comics">;

export type ComicSeriesSortField = ExtractSortField<"comicSeries">;
export type ComicSeriesFilterField = ExtractFilterField<"comicSeries">;

export type ComicReadlistsSortField = ExtractSortField<"comicReadlists">;
export type ComicReadlistsFilterField = ExtractFilterField<"comicReadlists">;

export type ComicSeriesGroupsSortField = ExtractSortField<"comicSeriesGroups">;
export type ComicSeriesGroupsFilterField = ExtractFilterField<"comicSeriesGroups">;
