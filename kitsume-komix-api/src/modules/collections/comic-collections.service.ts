
import { getComicSeriesGroupsFilteringSorting } from "#infrastructure/db/sqlite/models/comicSeriesGroups.model.ts";
import { getComicSeriesWithMetadataFilteringSorting } from "#infrastructure/db/sqlite/models/comicSeries.model.ts";

import { fetchComicSeries } from "#modules/series/index.ts"; 

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

  const serviceDataPagination: RequestPaginationParametersValidated =
    queryData.pagination;
  const serviceDataFilter:
    | RequestFilterParametersValidated<ComicSeriesGroupsFilterField>
    | undefined = queryData.filter;
  const serviceDataSort: RequestSortParametersValidated<
    ComicSeriesGroupsSortField
  > = queryData.sort;

  const comicSeriesGroups: ComicSeriesGroup[] = await getComicSeriesGroupsFilteringSorting({
    filters: [serviceDataFilter] as ComicSeriesGroupsFilterItem[],
    sort: {
      property: serviceDataSort.sortProperty,
      order: serviceDataSort.sortOrder,
    },
    offset: serviceDataPagination.pageNumber * serviceDataPagination.pageSize - serviceDataPagination.pageSize,
    limit: serviceDataPagination.pageSize + 1
  });

  const comicSeriesGroupsFormatted: ComicSeriesGroupWithComicBooks[] = [];

  for (const group of comicSeriesGroups) {
    const serviceParametersDataForComicInSeriesGroup: QueryDataMultiFilter = {
      page: 0,
      pageSize: 9999,
      sort: "seriesGroupPosition",
      sortDirection: "asc",
      filter: "comicSeriesGroupId",      
    }

    const subServiceData: RequestParametersValidated< ComicSeriesSortField, ComicSeriesFilterField> = validateAndBuildQueryParams(serviceParametersDataForComicInSeriesGroup, VALIDATE_COMIC_SERIES_KEY);

    const comicsSeriesInGroup: ComicSeriesWithMetadata[] = await fetchComicSeries(subServiceData, userId);

    // TODO: calculate totalSizeOfCollection, numberOfComicSeriesWithComicsReadByUser, numberOfComicSeriesWithComicsBeingReadByUser
    const finalGroupWithComics: ComicSeriesGroupWithComicBooks = {
      ...group,
      comicSeries: comicsSeriesInGroup,
      totalNumberOfComicSeries: comicsSeriesInGroup.length,
      totalSizeOfCollection: 0,
      numberOfComicSeriesWithComicsReadByUser: 0,
      numberOfComicSeriesWithComicsBeingReadByUser: 0,
    };

    comicSeriesGroupsFormatted.push(finalGroupWithComics);
  }


  return comicSeriesGroupsFormatted;
}