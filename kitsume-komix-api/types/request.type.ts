
// Request parameter types for service layer
export type RequestPaginationParameters = {
  page?: number;
  pageSize?: number;
};

export type RequestPaginationParametersValidated = {
  page: number;
  pageSize: number;
};

export type RequestSortParameters = {
  sortProperty?: string;
  sortOrder?: "asc" | "desc";
};

export type RequestFilterParameters = {
  filter?: string;
  filterProperty?: string;
};