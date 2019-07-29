export interface PaginationType {
  total: number;
  pageSize: number;
  current: number;
}

export interface QueryParamsType {
  include?: string;
  page?: number;
  pageSize?: number;
  nume?: string;
}
