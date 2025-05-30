import type { RequestWithPagination } from "../config/interfaces/i-pagination";
import { ServerRequest } from "../config/interfaces/i-request";
import { ResponseHelper } from "../utils/response-helper";

export async function paginationMiddleware(
  req: ServerRequest,
  defaultLimit = 10,
  maxLimit = 100,
): Promise<ServerRequest | Response> {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = Math.min(
      parseInt(url.searchParams.get("limit") || defaultLimit.toString()),
      maxLimit,
    );

    if (isNaN(page) || page < 1) throw new Error("Invalid page number");
    if (isNaN(limit) || limit < 1) throw new Error("Invalid limit value");

    const skip = (page - 1) * limit;

    const reqWithPagination = new ServerRequest(req) as RequestWithPagination;
    reqWithPagination.pagination = { skip, take: limit, page, limit };
    reqWithPagination.usePaginationResponse = true;

    return reqWithPagination;
  } catch (error) {
    return ResponseHelper.serverError(String(error));
  }
}

function isPaginatedRequest(req: ServerRequest): req is RequestWithPagination {
  const maybePaginated = req as unknown as Partial<RequestWithPagination>;
  return (
    typeof maybePaginated.usePaginationResponse === "boolean" &&
    typeof maybePaginated.pagination === "object" &&
    maybePaginated.pagination !== null &&
    typeof maybePaginated.pagination.limit === "number" &&
    typeof maybePaginated.pagination.page === "number"
  );
}

export async function autoPaginateResponse<T>(
  req: RequestWithPagination,
  itemsPromise: Promise<T[]>,
  countPromise: Promise<number>,
): Promise<Response> {
  const items = await itemsPromise;

  if (isPaginatedRequest(req)) {
    const { pagination } = req;
    const totalCount = await countPromise;
    const totalPages = Math.ceil(totalCount / (pagination?.limit || 1));

    return ResponseHelper.success({
      data: items,
      pagination: {
        totalCount,
        totalPages,
        currentPage: pagination?.page || 1,
        limit: pagination?.limit || 1,
      },
    });
  }

  return ResponseHelper.success(items);
}
