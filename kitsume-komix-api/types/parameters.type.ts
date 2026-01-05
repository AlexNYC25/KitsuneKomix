import { QueryableColumns } from "../constants/index.ts";

/**
 * Type helpers to extract sort and filter field types from QueryableColumns
 * for any data type (comics, series, readlists, etc.)
 */
export type ExtractSortField<T extends keyof typeof QueryableColumns> = 
    typeof QueryableColumns[T]["sort"][keyof typeof QueryableColumns[T]["sort"]];

export type ExtractFilterField<T extends keyof typeof QueryableColumns> = 
    typeof QueryableColumns[T]["filter"][keyof typeof QueryableColumns[T]["filter"]];


export type ComicSortField = ExtractSortField<"comics">;
export type ComicFilterField = ExtractFilterField<"comics">;

export type ComicSeriesSortField = ExtractSortField<"comicSeries">;
export type ComicSeriesFilterField = ExtractFilterField<"comicSeries">;

export type ComicReadlistsSortField = ExtractSortField<"comicReadlists">;
export type ComicReadlistsFilterField = ExtractFilterField<"comicReadlists">;