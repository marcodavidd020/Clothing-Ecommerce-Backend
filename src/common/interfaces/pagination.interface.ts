export interface IPaginationOptions {
  page?: number;
  limit?: number;
  route?: string;
}

export interface IPaginationMeta {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface IPaginatedResult<T> {
  data: T[];
  pagination: IPaginationMeta;
}
