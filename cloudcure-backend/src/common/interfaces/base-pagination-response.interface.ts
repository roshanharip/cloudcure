export interface BasePaginationResponse<T> {
  items: T[];
  total?: number; // Deprecated, use totalItems
  totalItems?: number;
  page?: number; // Deprecated, use currentPage
  currentPage?: number;
  limit?: number;
  totalPages: number;
}
