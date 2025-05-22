export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationResult {
  skip: number;
  take: number;
  page: number;
  limit: number;
}
export interface PaginatedRequest extends Request {
  pagination: {
    skip: number;
    take: number;
    page: number;
    limit: number;
  };
  usePaginationResponse: boolean;
}
