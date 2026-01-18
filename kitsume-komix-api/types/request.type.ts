import { z } from "zod";

import { PaginationSortFilterQuerySchema } from "../zod/schemas/request.schema.ts";

export type SortOrder = "asc" | "desc";

// The type representation of the query data when the request query = PaginationSortFilterQuerySchema is used.
export type QueryData = z.infer<typeof PaginationSortFilterQuerySchema>;

/**
 * The inital type for request parameters related to pagination.
 * 
 * These parameters should be the raw values received from the request,
 * and may be undefined if not provided by the client.
 */
export type RequestPaginationParameters = {
  page?: number;
  pageSize?: number;
};

/**
 * The validated type for request parameters related to pagination.
 * 
 * These parameters should have default values applied and be guaranteed
 * to be defined when used in the application logic.
 */
export type RequestPaginationParametersValidated = {
  page: number;
  pageSize: number;
};

/**
 * The inital type for request parameters related to sorting.
 * 
 * These parameters should be the raw values received from the request,
 * and may be undefined if not provided by the client.
 */
export type RequestSortParameters<TSortField extends string> = {
  sortProperty?: TSortField;
  sortOrder?: SortOrder;
};

/**
 * The validated type for request parameters related to sorting.
 * 
 * These parameters should have default values applied and be guaranteed
 * to be defined when used in the application logic.
 */
export type RequestSortParametersValidated<TSortField extends string> = {
  sortProperty: TSortField;
  sortOrder: SortOrder;
};


/** 
 * The inital type for request parameters related to filtering.
 * 
 * These parameters should be the raw values received from the request,
 * and may be undefined if not provided by the client.
 */
export type RequestFilterParameters<TFilterField extends string> = {
  filter?: string;
  filterProperty?: TFilterField;
};

/** 
 * The validated type for request parameters related to filtering.
 * 
 * These parameters should have default values applied and be guaranteed
 * to be defined when used in the application logic.
 */
export type RequestFilterParametersValidated<TFilterField extends string> = {
  filter?: string;
  filterProperty?: TFilterField;
};

/**
 * Type for request parameters related to data insertion.
 * 
 * Used in routes that support inserting new records.
 * At the initial stage, the data is represented as a generic record,
 * with key/value pairs, to be validated and processed later.
 */
export type RequestInsertionParameters = {
	insertData: Record<string, unknown>;
};

/**
 * Type for request parameters related to data insertion.
 * 
 * Used in routes that support inserting new records.
 * At this stage, the data has been validated and typed accordingly.
 * Such as making sure that the inserted data matches the expected structure.
 * T represents the specific type of the data to be inserted.
 */
export type RequestInsertionParametersValidated = {
	insertData: Record<string, string | number | boolean | null>;
};

/**
 * Type for request parameters related to data updating.
 * 
 * Used in routes that support updating existing records.
 * At the initial stage, the data is represented as a generic record,
 * with key/value pairs, to be validated and processed later.
 */
export type RequestUpdateParameters = {
	updateData: Record<string, unknown>;
};

/**
 * Type for request parameters related to data updating.
 * 
 * Used in routes that support updating existing records.
 * At this stage, the data has been validated and typed accordingly.
 * Such as making sure that the updated data matches the expected structure.
 * T represents the specific type of the data to be updated.
 */
export type RequestUpdateParametersValidated = {
	updateData: Record<string, string | number | boolean | null>;
};

/**
 * Combined type for all validated request parameters.
 * 
 * Includes pagination, sorting, filtering, insertion, and updating parameters.
 * Should be the final form of request parameters after validation and defaulting.
 */
export type RequestParametersValidated<
  TSortField extends string,
  TFilterField extends string = never
> = {
  pagination: RequestPaginationParametersValidated;
  sort: RequestSortParametersValidated<TSortField>;
  filter?: RequestFilterParametersValidated<TFilterField>;

  insertDetails?: RequestInsertionParametersValidated;
  updateDetails?: RequestUpdateParametersValidated;
};
