import type { ServerRequest } from "./i-request";

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

export interface RequestWithPagination extends ServerRequest {
  pagination?: PaginationResult;
  usePaginationResponse?: boolean;
}
