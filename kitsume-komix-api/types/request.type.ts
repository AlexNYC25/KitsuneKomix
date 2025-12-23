
export type SortOrder = "asc" | "desc";

// Request parameter types for service layer
export type RequestPaginationParameters = {
  page?: number;
  pageSize?: number;
};

export type RequestPaginationParametersValidated = {
  page: number;
  pageSize: number;
};

export type RequestSortParameters<TSortField extends string> = {
  sortProperty?: TSortField;
  sortOrder?: SortOrder;
};

export type RequestSortParametersValidated<TSortField extends string> = {
  sortProperty: TSortField;
  sortOrder: SortOrder;
};

export type RequestFilterParameters<TFilterField extends string> = {
  filter?: string;
  filterProperty?: TFilterField;
};

export type RequestFilterParametersValidated<TFilterField extends string> = {
  filter?: string;
  filterProperty?: TFilterField;
};