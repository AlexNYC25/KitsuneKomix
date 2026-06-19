
import { fetchComicSeriesWithRelatedMetadata } from "#modules/series/index.ts"; 

import {
  validateAndBuildQueryParams,
  VALIDATE_COMIC_SERIES_KEY,
} from "#utilities/parameters.ts";

import type {
  QueryDataMultiFilter,
  RequestParametersValidated,
  RequestFilterParametersValidated,
  RequestSortParametersValidated,
  RequestPaginationParametersValidated,
  ComicSeriesGroupsFilterItem,
  ComicSeriesGroupsSortField,
  ComicSeriesGroupsFilterField,
  ComicSeriesGroupWithComicBooks,
  ComicSeriesGroup,
  ComicSortField,
  ComicFilterField,
  ComicSeriesSortField,
  ComicSeriesFilterField,
  ComicSeriesWithMetadata,
} from "#types/index.ts";

export const fetchComicSeriesGroups = async (
  queryData: RequestParametersValidated<
    ComicSeriesGroupsSortField,
    ComicSeriesGroupsFilterField
  >,
  userId: number
): Promise<ComicSeriesGroupWithComicBooks[]> => {

  return []; // TEMP Until new functionality is implemented
}