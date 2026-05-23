import { z } from "zod";

import { QueryableColumns } from "#infrastructure/db/sqlite/queryableColumns.ts";
import { VALIDATE_COMIC_KEY, VALIDATE_COMIC_SERIES_KEY } from "#utilities/parameters.ts";

const columnConfigComics = QueryableColumns[VALIDATE_COMIC_KEY];
const columnConfigComicSeries = QueryableColumns[VALIDATE_COMIC_SERIES_KEY];

const ALLOWED_COMIC_FILTERS = Object.values(columnConfigComics.filter);
const ALLOWED_COMIC_SERIES_FILTERS = Object.values(columnConfigComicSeries.filter);

export const AllowedComicFiltersSchema = z.enum(ALLOWED_COMIC_FILTERS);
export const AllowedComicSeriesFiltersSchema = z.enum(ALLOWED_COMIC_SERIES_FILTERS);