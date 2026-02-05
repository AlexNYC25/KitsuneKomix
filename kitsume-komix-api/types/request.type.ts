import { z } from "zod";

import {
  PaginationSortFilterQuerySchema, 
  PaginationLetterQuerySchema,
  ComicMetadataSingleUpdateSchema, 
  ComicMetadataBulkUpdateSchema 
} from "#schemas/request.schema.ts";

import { metadataUpdateSchema } from "#schemas/data/comicMetadata.schema.ts";

// *** Zod Inferred Types ***

export type SortOrder = "asc" | "desc";

// The type representation of the query data when the request query = PaginationSortFilterQuerySchema is used.
export type QueryData = z.infer<typeof PaginationSortFilterQuerySchema>;

// The type representation of the query data when the request query = PaginationSortFilterQuerySchema + PaginationLetterQuerySchema is used.
// Basically adds the letter param value to the QueryData type.
export type QueryDataWithLetter = z.infer<typeof PaginationSortFilterQuerySchema> & z.infer<typeof PaginationLetterQuerySchema>;

export type ComicMetadataSingleUpdateData = z.infer<typeof ComicMetadataSingleUpdateSchema >;
export type ComicMetadataBulkUpdateData = z.infer<typeof ComicMetadataBulkUpdateSchema>;

export type ComicMetadataUpdateData = z.infer<typeof metadataUpdateSchema>;

// *** Service Request Parameter Types ***

/**
 * The validated type for request parameters related to pagination.
 * 
 * These parameters should have default values applied and be guaranteed
 * to be defined when used in the application logic.
 */
export type RequestPaginationParametersValidated = {
  pageNumber: number;
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
  filterValue?: string;
  filterProperty?: TFilterField;
};

/** 
 * The validated type for request parameters related to filtering.
 * 
 * These parameters should have default values applied and be guaranteed
 * to be defined when used in the application logic.
 */
export type RequestFilterParametersValidated<TFilterField extends string> = {
  filterValue?: string;
  filterProperty?: TFilterField;
};

/**
 * Type for request parameters related to data insertion.
 * 
 * Used in routes that support inserting new records.
 * At this stage, the data has been validated and typed accordingly.
 * Such as making sure that the inserted data matches the expected structure.
 * T represents the specific type of the data to be inserted.
 */
type RequestInsertionParametersValidated = {
	insertData: Record<string, string | number | boolean | null>;
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