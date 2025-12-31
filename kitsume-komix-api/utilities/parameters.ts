import {
	RequestFilterParameters,
  RequestSortParameters,
	RequestPaginationParameters,
  RequestPaginationParametersValidated,
	QueryData,
  RequestParametersValidated
} from "#types/index.ts";

import {
	PAGE_SIZE_DEFAULT, 
	PAGE_NUMBER_DEFAULT,
	FILTER_SORT_DEFAULT
} from "../utilities/constants.ts";

import type { ComicBookQueryParams, ComicStoryArcQueryParams } from "#interfaces/index.ts";

import { QueryableColumns } from "../constants/index.ts";


const comicQueryableColumns = QueryableColumns["comics"];
const comicQueryableColumnsFiltering: string[] = Object.values(comicQueryableColumns.filter);
const comicQueryableColumnsSorting: string[] = Object.values(comicQueryableColumns.sort);

type ComicSortField = typeof comicQueryableColumnsSorting[number];
type ComicFilterField = typeof comicQueryableColumnsFiltering[number];

/**
 * Validates and sanitizes filter parameters.
 * 
 * @param params RequestFilterParameters
 * @param allowedFilterFields An array of allowed fields to filter by
 * @returns RequestFilterParameters
 */
export const validateFilterParameters = (
	params: RequestFilterParameters,
	allowedFilterFields: string[],
): RequestFilterParameters => {
	const filterProperty = params.filterProperty && allowedFilterFields.includes(params.filterProperty)
		? params.filterProperty
		: undefined;

	const filter = params.filter && filterProperty ? params.filter : undefined;

	params.filterProperty = filterProperty;
	params.filter = filter;

	return params;
}

/**
 * Validates and sanitizes sort parameters.
 * 
 * @param params RequestSortParameters
 * @param allowedSortFields An array of allowed fields to sort by
 * @param defaultSortBy A string representing the default sort field
 * @returns RequestSortParameters
 */
export const validateSortParameters = (
	params: RequestSortParameters,
	allowedSortFields: string[],
	defaultSortBy: string
): RequestSortParameters => {
	const sortProperty = params.sortProperty && allowedSortFields.includes(params.sortProperty)
		? params.sortProperty
		: defaultSortBy;

	const sortOrder = params.sortOrder && (params.sortOrder === "asc" || params.sortOrder === "desc")
		? params.sortOrder
		: FILTER_SORT_DEFAULT;

	params.sortProperty = sortProperty;
	params.sortOrder = sortOrder;

	return params;
}

/**
 * Validates and sanitizes pagination parameters.
 * 
 * @param params 
 * @returns 
 */
export const validatePaginationParameters = (
	params: RequestPaginationParameters,
): RequestPaginationParametersValidated => {
	const page = params.page && params.page > 0 ? params.page : PAGE_NUMBER_DEFAULT;
	const pageSize = params.pageSize && params.pageSize > 0 ? params.pageSize : PAGE_SIZE_DEFAULT;

	return {page, pageSize};
}

/**
 * Maps filter property names to their corresponding query parameter names.
 * Handles aliases for common filter fields.
 * 
 * @param filterProperty The filter property name to map
 * @param filterValue The filter value to apply
 * @returns Object with mapped query parameter key and value, or null if invalid
 */
export const mapComicFilterPropertyToQueryParam = (
	filterProperty: string,
	filterValue: string
): { key: string; value: string | number } | null => {
	if (!filterProperty || !filterValue) {
		return null;
	}

	const trimmedValue = filterValue.trim();
	const normalizedProperty = filterProperty.toLowerCase();

	switch (normalizedProperty) {
		case "title":
			return { key: "titleFilter", value: trimmedValue };
		case "series":
		case "series_name":
			return { key: "seriesFilter", value: trimmedValue };
		case "writer":
		case "writers":
			return { key: "writerFilter", value: trimmedValue };
		case "artist":
		case "penciller":
		case "inker":
		case "colorist":
		case "cover_artist":
			return { key: "artistFilter", value: trimmedValue };
		case "publisher":
		case "publishers":
			return { key: "publisherFilter", value: trimmedValue };
		case "genre":
		case "genres":
			return { key: "genreFilter", value: trimmedValue };
		case "character":
		case "characters":
			return { key: "characterFilter", value: trimmedValue };
		case "year":
		case "publication_year": {
			const yearNum = parseInt(trimmedValue, 10);
			return !isNaN(yearNum) 
				? { key: "yearFilter", value: yearNum }
				: null;
		}
		default:
			// Use general filter for unrecognized properties
			return { key: "generalFilter", value: trimmedValue };
	}
};

/**
 * Maps sort property names to their corresponding database column names.
 * Handles aliases for common sort fields and defaults to "created_at" if unrecognized.
 * 
 * @param sortProperty The sort property name to map
 * @param sortOrder The sort order (asc/desc), defaults to "asc"
 * @returns Object with mapped sortBy column name and sortOrder, or null if invalid
 */
export const mapComicSortPropertyToQueryParam = (
	sortProperty: string,
	sortOrder: string = FILTER_SORT_DEFAULT
): { sortBy: string; sortOrder: string } | null => {
	if (!sortProperty) {
		return null;
	}

	const normalizedProperty = sortProperty.toLowerCase();
	const normalizedOrder = sortOrder.toLowerCase();

	// Validate sort order
	const validSortOrder = (normalizedOrder === "asc" || normalizedOrder === "desc") 
		? normalizedOrder 
		: FILTER_SORT_DEFAULT;

	// Map sort properties to database columns
	let sortByColumn: string;
	switch (normalizedProperty) {
		case "title":
			sortByColumn = "title";
			break;
		case "series":
		case "series_name":
			sortByColumn = "series";
			break;
		case "issue_number":
			sortByColumn = "issue_number";
			break;
		case "publication_year":
		case "year":
			sortByColumn = "publication_year";
			break;
		case "created_at":
			sortByColumn = "created_at";
			break;
		case "updated_at":
			sortByColumn = "updated_at";
			break;
		case "file_name":
		case "file_path":
			sortByColumn = "file_name";
			break;
		case "writer":
			sortByColumn = "writer";
			break;
		case "publisher":
			sortByColumn = "publisher";
			break;
		case "genre":
			sortByColumn = "genre";
			break;
		default:
			// Default to created_at for unrecognized properties
			sortByColumn = "created_at";
			break;
	}

	return {
		sortBy: sortByColumn,
		sortOrder: validSortOrder
	};
};

/**
 * Maps filter property names to their corresponding query parameter names.
 * Handles aliases for common filter fields.
 * 
 * @param filterProperty The filter property name to map
 * @param filterValue The filter value to apply
 * @returns Object with mapped query parameter key and value, or null if invalid
 */
export const mapReadlistFilterPropertyToQueryParam = (
	filterProperty: string,
	filterValue: string
): { key: string; value: string | number } | null => {
	if (!filterProperty || !filterValue) {
		return null;
	}

	const trimmedValue = filterValue.trim();
	const normalizedProperty = filterProperty.toLowerCase();

	switch (normalizedProperty) {
		case "name":
			return { key: "nameFilter", value: trimmedValue };
		case "description":
			return { key: "descriptionFilter", value: trimmedValue };
		default:
			// Use general filter for unrecognized properties
			return { key: "generalFilter", value: trimmedValue };
	}
};

/**
 * Maps sort property names to their corresponding database column names.
 * Handles aliases for common sort fields and defaults to "created_at" if unrecognized.
 * 
 * @param sortProperty The sort property name to map
 * @param sortOrder The sort order (asc/desc), defaults to "asc"
 * @returns Object with mapped sortBy column name and sortOrder, or null if invalid
 */
export const mapReadlistSortPropertyToQueryParam = (
	sortProperty: string,
	sortOrder: string = FILTER_SORT_DEFAULT
): { sortBy: string; sortOrder: string } | null => {
	if (!sortProperty) {
		return null;
	}

	const normalizedProperty = sortProperty.toLowerCase();
	const normalizedOrder = sortOrder.toLowerCase();

	// Validate sort order
	const validSortOrder = (normalizedOrder === "asc" || normalizedOrder === "desc") 
		? normalizedOrder 
		: FILTER_SORT_DEFAULT;

	// Map sort properties to database columns
	let sortByColumn: string;
	switch (normalizedProperty) {
		case "name":
			sortByColumn = "name";
			break;
		case "description":
			sortByColumn = "description";
			break;
		default:
			// Default to created_at for unrecognized properties
			sortByColumn = "created_at";
			break;
	}

	return {
		sortBy: sortByColumn,
		sortOrder: validSortOrder
	};
};

/**
 * Builds a ComicBookQueryParams object from request parameters.
 * Combines pagination, filter, and sort parameters into a single query object.
 * 
 * @param paginationParams Validated pagination parameters (page, pageSize)
 * @param filterParams Filter parameters (filterProperty, filter)
 * @param sortParams Sort parameters (sortProperty, sortOrder)
 * @returns ComicBookQueryParams object ready for database query
 */
export const buildComicBookQueryParams = (
	paginationParams: RequestPaginationParametersValidated,
	filterParams: RequestFilterParameters,
	sortParams: RequestSortParameters
): ComicBookQueryParams => {
	// Calculate offset for pagination
	const offset = (paginationParams.page - 1) * paginationParams.pageSize;

	// Initialize query params with pagination
	const queryParams: ComicBookQueryParams = {
		offset,
		limit: paginationParams.pageSize + 1, // +1 to check for next page
	};

	// Apply filter if provided
	if (filterParams.filterProperty && filterParams.filter) {
		const filterMapping = mapComicFilterPropertyToQueryParam(
			filterParams.filterProperty,
			filterParams.filter
		);

		if (filterMapping) {
			queryParams[filterMapping.key as keyof ComicBookQueryParams] =
				filterMapping.value as never;
		}
	}

	// Apply sort if provided
	if (sortParams.sortProperty && sortParams.sortOrder) {
		const sortMapping = mapComicSortPropertyToQueryParam(
			sortParams.sortProperty,
			sortParams.sortOrder
		);

		if (sortMapping) {
			queryParams.sortBy = sortMapping.sortBy as ComicBookQueryParams["sortBy"];
			queryParams.sortOrder = sortMapping.sortOrder as "asc" | "desc";
		}
	}

	return queryParams;
};


/**
 * Builds a ComicBookQueryParams object from request parameters.
 * Combines pagination, filter, and sort parameters into a single query object.
 * 
 * @param paginationParams Validated pagination parameters (page, pageSize)
 * @param filterParams Filter parameters (filterProperty, filter)
 * @param sortParams Sort parameters (sortProperty, sortOrder)
 * @returns ComicBookQueryParams object ready for database query
 */
export const buildStoryArcQueryParams = (
	paginationParams: RequestPaginationParametersValidated,
	filterParams: RequestFilterParameters,
	sortParams: RequestSortParameters
): ComicStoryArcQueryParams => {
	// Calculate offset for pagination
	const offset = (paginationParams.page - 1) * paginationParams.pageSize;

	// Initialize query params with pagination
	const queryParams: ComicStoryArcQueryParams = {
		offset,
		limit: paginationParams.pageSize + 1, // +1 to check for next page
	};

	// Apply filter if provided
	if (filterParams.filterProperty && filterParams.filter) {
		const filterMapping = mapReadlistFilterPropertyToQueryParam(
			filterParams.filterProperty,
			filterParams.filter
		);

		if (filterMapping) {
			queryParams[filterMapping.key as keyof ComicStoryArcQueryParams] =
				filterMapping.value as never;
		}
	}

	// Apply sort if provided
	if (sortParams.sortProperty && sortParams.sortOrder) {
		const sortMapping = mapReadlistSortPropertyToQueryParam(
			sortParams.sortProperty,
			sortParams.sortOrder
		);

		if (sortMapping) {
			queryParams.sortBy = sortMapping.sortBy as ComicStoryArcQueryParams["sortBy"];
			queryParams.sortOrder = sortMapping.sortOrder as "asc" | "desc";
		}
	}

	return queryParams;
}

///////////// Start of rewrite for unified query param validation /////////////

export const buildServiceDataParmamter = (
	q: QueryData,
	dataType: "comics"
) => {
	// switch here depending on the datatype
	switch (dataType) {
		case "comics":
			// build comic book query params
			break;
		default:
			return null;
	}
	

}


/**
 * The Top-level function to validate and build service query parameters
 * from raw request query data.
 */
export const validateAndBuildServiceQueryParamsForComics = (
	q: QueryData,
) : RequestParametersValidated<ComicSortField,ComicFilterField> => {
	// First we validate and sanitize each set of parameters
	
	// Pagination

	// filter

	// sort

	// Then we build the final query params object

	return null;
}