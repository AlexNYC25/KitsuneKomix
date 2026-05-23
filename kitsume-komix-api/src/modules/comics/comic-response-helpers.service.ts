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
	};

	return {
		data: resultComics,
		meta: responseMeta,
	};
};
