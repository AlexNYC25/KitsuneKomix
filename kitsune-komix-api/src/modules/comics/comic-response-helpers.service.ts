import type {
	ComicBookWithMetadata,
	ComicBookMultipleResponse,
	ComicBookMultipleResponseMeta,
	ComicBookMultipleResponseData,
	RequestPaginationParametersValidated,
	RequestFilterParametersValidated,
	RequestSortParametersValidated,
	ComicFilterField,
	ComicSortField,
} from "#types/index.ts";

/**
 * Helper that takes the data found in the service layer for comics, along with the validated pagination, filter, and sort parameters from the request, 
 * and packages them into a properly structured response object according to the ComicBookMultipleResponse type. 
 * 
 * This includes slicing the data for pagination, determining if there is a next page, and structuring the metadata with information about the current page, 
 * page size, filters applied, and sort order.
 * 
 * @param comicsFound Data with metadata ready for returning as part of the response
 * @param serviceDataPagination Validated Pagination data
 * @param serviceDataFilters Validated Filter data, if any was provided in the request
 * @param serviceDataSort Validated Sort data
 * @returns an object ready to be returned as the response, with data and metadata properly structured according to the ComicBookMultipleResponse type
 */
export const packDataIntoComicBookMultipleResponse = (
	comicsFound: ComicBookWithMetadata[],
	serviceDataPagination: RequestPaginationParametersValidated,
	serviceDataFilters: RequestFilterParametersValidated<ComicFilterField>[] | undefined,
	serviceDataSort: RequestSortParametersValidated<ComicSortField>
): ComicBookMultipleResponse => {

	const hasNextPage: boolean =
		comicsFound.length > serviceDataPagination.pageSize;
	const resultComics: ComicBookMultipleResponseData = hasNextPage
		? comicsFound.slice(0, serviceDataPagination.pageSize)
		: comicsFound;


	const filters = serviceDataFilters?.map((f: RequestFilterParametersValidated<ComicFilterField>) => ({
		filterProperty: f.filterProperty ?? "",
		filterValue: f.filterValue ?? "",
	}));


  const responseMeta: ComicBookMultipleResponseMeta = {
		count: resultComics.length,
		hasNextPage: hasNextPage,
		currentPage: serviceDataPagination.pageNumber,
		pageSize: serviceDataPagination.pageSize,
		filters: filters,
		sortProperty: serviceDataSort.sortProperty,
		sortOrder: serviceDataSort.sortOrder,
		timestamp: new Date().toISOString(),
	};

	return {
		data: resultComics,
		meta: responseMeta,
	};
};
