import {
	RequestPaginationParametersValidated,
	QueryData,
  RequestParametersValidated,
  SortOrder
} from "#types/index.ts";

import {
	PAGE_SIZE_DEFAULT, 
	PAGE_NUMBER_DEFAULT,
	FILTER_SORT_DEFAULT
} from "../utilities/constants.ts";

import { QueryableColumns } from "../constants/index.ts";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

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


// ============================================================================
// PARAMETER VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validates pagination parameters (page, pageSize)
 * @param page Raw page number from request
 * @param pageSize Raw page size from request
 * @returns Validated pagination parameters with defaults applied
 */
const validatePagination = (
	page?: number,
	pageSize?: number,
): RequestPaginationParametersValidated => {
	const validPage = page && page > 0 ? page : PAGE_NUMBER_DEFAULT;
	const validPageSize = pageSize && pageSize > 0 ? pageSize : PAGE_SIZE_DEFAULT;

	return { page: validPage, pageSize: validPageSize };
};

/**
 * Validates sort parameters against allowed columns for a data type
 * @param sortProperty The column to sort by
 * @param sortDirection The sort direction (asc/desc)
 * @param allowedSortFields Array of allowed sort field names
 * @param defaultSort Default sort field to use if invalid
 * @returns Validated sort property and order
 */
const validateSort = (
	sortProperty: string | undefined,
	sortDirection: "asc" | "desc" | undefined,
	allowedSortFields: string[],
	defaultSort: string,
): { sortProperty: string; sortOrder: SortOrder } => {
	// Validate sort property is in allowed list
	const validSortProperty = sortProperty && allowedSortFields.includes(sortProperty)
		? sortProperty
		: defaultSort;

	// Validate sort order is asc or desc
	const validSortOrder: SortOrder = (sortDirection === "asc" || sortDirection === "desc")
		? sortDirection
		: FILTER_SORT_DEFAULT as SortOrder;

	return {
		sortProperty: validSortProperty,
		sortOrder: validSortOrder,
	};
};

/**
 * Validates filter parameters against allowed columns for a data type
 * @param filterProperty The column to filter by
 * @param filterValue The filter value
 * @param allowedFilterFields Array of allowed filter field names
 * @returns Validated filter property and value, or undefined if invalid
 */
const validateFilter = (
	filterProperty: string | undefined,
	filterValue: string | undefined,
	allowedFilterFields: string[],
): { filterProperty: string; filterValue: string } | undefined => {
	// Both property and value must be present
	if (!filterProperty || !filterValue) {
		return undefined;
	}

	// Property must be in allowed list
	if (!allowedFilterFields.includes(filterProperty)) {
		return undefined;
	}

	return {
		filterProperty,
		filterValue: filterValue.trim(),
	};
};


// ============================================================================
// MAIN PARAMETER BUILDER - FUNCTION OVERLOADS
// ============================================================================

/**
 * Overload signatures for type-safe parameter building based on data type.
 * Each overload provides specific sort/filter field types for that data type.
 */

export function validateAndBuildQueryParams(
	queryData: QueryData,
	dataType: "comics"
): RequestParametersValidated<ComicSortField, ComicFilterField>;

export function validateAndBuildQueryParams(
	queryData: QueryData,
	dataType: "comicSeries"
): RequestParametersValidated<ComicSeriesSortField, ComicSeriesFilterField>;

export function validateAndBuildQueryParams(
	queryData: QueryData,
	dataType: "comicReadlists"
): RequestParametersValidated<ComicReadlistsSortField, ComicReadlistsFilterField>;

export function validateAndBuildQueryParams(
	queryData: QueryData,
	dataType: keyof typeof QueryableColumns
): RequestParametersValidated<string, string>;

/**
 * Validates and builds query parameters from raw request query data.
 * 
 * This function handles:
 * - Pagination validation (page, pageSize)
 * - Sort validation (ensures sortProperty is in allowed columns)
 * - Filter validation (ensures filterProperty is in allowed columns)
 * 
 * Returns a RequestParametersValidated object ready to pass to service functions.
 * The return type is specific to the data type requested, providing full type safety.
 * 
 * @param queryData The raw query data from the request (verified with Zod)
 * @param dataType The type of data being queried ("comics", "series", etc.)
 * @returns RequestParametersValidated with type-specific sort and filter fields
 * @throws Error if dataType is not recognized in QueryableColumns
 * 
 * @example
 * const params = validateAndBuildQueryParams(queryData, "comics");
 * // params is now: RequestParametersValidated<ComicSortField, ComicFilterField>
 * // Can safely pass to service functions
 */
export function validateAndBuildQueryParams(
	queryData: QueryData,
	dataType: keyof typeof QueryableColumns,
): RequestParametersValidated<string, string> {
	// Get the queryable columns for this data type
	const columnConfig = QueryableColumns[dataType];

	if (!columnConfig) {
		throw new Error(`Unknown data type: ${dataType}`);
	}

	// Extract allowed columns
	const allowedSortFields = Object.values(columnConfig.sort);
	const allowedFilterFields = Object.values(columnConfig.filter);

	// Validate and build each parameter set
	const pagination = validatePagination(queryData.page, queryData.pageSize);

	const sort = validateSort(
		queryData.sortProperty,
		queryData.sortDirection,
		allowedSortFields,
		allowedSortFields[0] || "createdAt", // Use first allowed field as default
	);

	const filter = validateFilter(
		queryData.filterProperty,
		queryData.filter,
		allowedFilterFields,
	);

	// Return the validated parameters object
	return {
		pagination,
		sort,
		filter,
	};
}