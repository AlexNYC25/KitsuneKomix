
import type {
	ComicSeriesWithMetadata,
	RequestPaginationParametersValidated,
	RequestFilterParametersValidated,
	RequestSortParametersValidated,
	ComicSeriesFilterField,
	ComicSeriesSortField,
	ComicSeriesMultipleResponseData,
	ComicSeriesMultipleResponseMeta,
} from "#types/index.ts";
import { ComicSeriesMultipleResponse } from "#types/responses.type.ts";

/**
 * Helper that takes the data found in the service layer for comic series, along with the validated pagination, filter, and sort parameters from the request,
 * and packages them into a properly structured response object according to the ComicSeriesMultipleResponse type.
 * 
 * This includes slicing the data for pagination, determining if there is a next page, and structuring the metadata with information about the current page,
 * page size, filters applied, and sort order.
 * 
 * @param comicSeries Data with metadata ready for returning as part of the response
 * @param serviceDataPagination Validated Pagination data
 * @param serviceDataFilters Validated Filter data, if any was provided in the request
 * @param serviceDataSort Validated Sort data
 * @returns an object ready to be returned as the response, with data and metadata properly structured according to the ComicSeriesMultipleResponse type
 */
export const packDataIntoComicSeriesMultipleResponse = (
	comicSeries: ComicSeriesWithMetadata[],
	serviceDataPagination: RequestPaginationParametersValidated,
	serviceDataFilters: RequestFilterParametersValidated<ComicSeriesFilterField>[] | undefined,
	serviceDataSort: RequestSortParametersValidated<ComicSeriesSortField>
): ComicSeriesMultipleResponse => {

	const hasNextPage: boolean =
		comicSeries.length > serviceDataPagination.pageSize;
	const resultComicSeries: ComicSeriesMultipleResponseData = hasNextPage
		? comicSeries.slice(0, serviceDataPagination.pageSize)
		: comicSeries;

	const filters = serviceDataFilters?.map((f: RequestFilterParametersValidated<ComicSeriesFilterField>) => ({
		filterProperty: f.filterProperty ?? "",
		filterValue: f.filterValue ?? "",
	}));

	const responseMetadata: ComicSeriesMultipleResponseMeta = {
		count: resultComicSeries.length,
		hasNextPage: hasNextPage,
		currentPage: serviceDataPagination.pageNumber,
		pageSize: serviceDataPagination.pageSize,
		filters: filters,
		sortProperty: serviceDataSort.sortProperty,
		sortOrder: serviceDataSort.sortOrder,
	};

	return {
		data: resultComicSeries,
		meta: responseMetadata,
	};
};