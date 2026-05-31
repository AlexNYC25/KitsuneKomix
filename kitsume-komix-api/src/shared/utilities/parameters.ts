import type {
  ComicFilterField,
  ComicReadlistsFilterField,
  ComicReadlistsSortField,
  ComicSeriesFilterField,
  ComicSeriesSortField,
  ComicSortField,
  QueryData,
  QueryDataMultiFilter,
  RequestFilterParametersValidated,
  RequestPaginationParametersValidated,
  RequestParametersValidated,
  SortOrder,
} from "#types/index.ts";

import {
  env
} from "#config/env.ts";

import {
  getAllowedFilterFields,
  getAllowedSortFields,
  type QueryableDomain,
} from "#zod/schemas/data/queryableColumns.schema.ts";

export const VALIDATE_COMIC_KEY = "comics"
export const VALIDATE_COMIC_SERIES_KEY = "comicSeries"

// ============================================================================
// PARAMETER VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validates pagination parameters (page, pageSize)
 * @param page Raw page number from request
 * @param pageSize Raw page size from request
 * @returns Validated pagination parameters with defaults applied
 */
export const validatePagination = (
  page?: number,
  pageSize?: number,
): RequestPaginationParametersValidated => {
  const validPageNumber = page && page > 0 ? page : env.PAGE_NUMBER;
  const validPageSize = pageSize && pageSize > 0 ? pageSize : env.PAGE_SIZE;

  return { pageNumber: validPageNumber, pageSize: validPageSize };
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
  const validSortProperty =
    sortProperty && allowedSortFields.includes(sortProperty)
      ? sortProperty
      : defaultSort;

  // Validate sort order is asc or desc
  const validSortOrder: SortOrder =
    (sortDirection === "asc" || sortDirection === "desc")
      ? sortDirection
      : env.FILTER_SORT as SortOrder;

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

/**
 * Validates an array of filter pairs against allowed columns for a data type.
 *
 * Accepts either a single string or an array of strings for both filterProperties
 * and filterValues, normalising both to arrays and pairing them by index.
 * Pairs where the property is not in the allowed list are silently dropped.
 *
 * @param filterProperties Single property name or array of property names
 * @param filterValues Single filter value or array of filter values
 * @param allowedFilterFields Array of allowed filter field names
 * @returns Array of validated { filterProperty, filterValue } pairs (may be empty)
 */
export const validateFilters = <TFilterField extends string>(
  filterProperties: string | string[] | undefined,
  filterValues: string | string[] | undefined,
  allowedFilterFields: string[],
): RequestFilterParametersValidated<TFilterField>[] => {
  const props = Array.isArray(filterProperties)
    ? filterProperties
    : filterProperties ? [filterProperties] : [];
  const vals = Array.isArray(filterValues)
    ? filterValues
    : filterValues ? [filterValues] : [];

  const result: RequestFilterParametersValidated<TFilterField>[] = [];
  const len = Math.min(props.length, vals.length);
  for (let i = 0; i < len; i++) {
    const prop = props[i];
    const val = vals[i];
    if (prop && val && allowedFilterFields.includes(prop)) {
      result.push({
        filterProperty: prop as TFilterField,
        filterValue: val.trim(),
      });
    }
  }
  return result;
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
  dataType: typeof VALIDATE_COMIC_KEY,
): RequestParametersValidated<ComicSortField, ComicFilterField>;

export function validateAndBuildQueryParams(
  queryData: QueryDataMultiFilter,
  dataType: typeof VALIDATE_COMIC_KEY,
): RequestParametersValidated<ComicSortField, ComicFilterField>;

export function validateAndBuildQueryParams(
  queryData: QueryData,
  dataType: typeof VALIDATE_COMIC_SERIES_KEY,
): RequestParametersValidated<ComicSeriesSortField, ComicSeriesFilterField>;

export function validateAndBuildQueryParams(
  queryData: QueryDataMultiFilter,
  dataType: typeof VALIDATE_COMIC_SERIES_KEY,
): RequestParametersValidated<ComicSeriesSortField, ComicSeriesFilterField>;

export function validateAndBuildQueryParams(
  queryData: QueryData,
  dataType: "comicReadlists",
): RequestParametersValidated<
  ComicReadlistsSortField,
  ComicReadlistsFilterField
>;

export function validateAndBuildQueryParams(
  queryData: QueryData,
  dataType: QueryableDomain,
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
  queryData: QueryData | QueryDataMultiFilter,
  dataType: QueryableDomain,
): RequestParametersValidated<string, string> {
  const allowedSortFields = [...getAllowedSortFields(dataType)];
  const allowedFilterFields = [...getAllowedFilterFields(dataType)];

  // Validate and build each parameter set
  const pagination = validatePagination(queryData.page, queryData.pageSize);

  const sort = validateSort(
    queryData.sort,
    queryData.sortDirection,
    allowedSortFields,
    allowedSortFields[0] || "createdAt", // Use first allowed field as default
  );

  // When either field is an array, validate as multiple filters.
  // Otherwise fall back to the single-filter path.
  const isMultiFilter =
    Array.isArray(queryData.filterProperty) ||
    Array.isArray(queryData.filter);

  if (isMultiFilter) {
    const filters = validateFilters(
      queryData.filterProperty as string | string[] | undefined,
      queryData.filter as string | string[] | undefined,
      allowedFilterFields,
    );
    return { pagination, sort, filters };
  }

  const filter = validateFilter(
    queryData.filterProperty as string | undefined,
    queryData.filter as string | undefined,
    allowedFilterFields,
  );

  // Return the validated parameters object
  return {
    pagination,
    sort,
    filter,
  };
}
