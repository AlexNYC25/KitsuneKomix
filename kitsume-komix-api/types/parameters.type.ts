import { QueryableColumns } from "../constants/index.ts";

/**
 * Type helpers to extract sort and filter field types from QueryableColumns
 * for any data type (comics, series, readlists, etc.)
 */
type ExtractSortField<T extends keyof typeof QueryableColumns> = 
    typeof QueryableColumns[T]["sort"][keyof typeof QueryableColumns[T]["sort"]];

type ExtractFilterField<T extends keyof typeof QueryableColumns> = 
    typeof QueryableColumns[T]["filter"][keyof typeof QueryableColumns[T]["filter"]];


type ComicSortField = ExtractSortField<"comics">;
type ComicFilterField = ExtractFilterField<"comics">;

type ComicSeriesSortField = ExtractSortField<"comicSeries">;
type ComicSeriesFilterField = ExtractFilterField<"comicSeries">;

type ComicReadlistsSortField = ExtractSortField<"comicReadlists">;
type ComicReadlistsFilterField = ExtractFilterField<"comicReadlists">;