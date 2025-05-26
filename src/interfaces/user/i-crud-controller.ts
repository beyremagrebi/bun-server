import type { RequestWithPagination } from "../../config/interfaces/i-pagination";
import type { ServerRequest } from "../../config/interfaces/i-request";

export interface ICRUDController {
  getAll(req: RequestWithPagination): Promise<Response>;
  create(req: ServerRequest): Promise<Response>;
  getById(req: ServerRequest): Promise<Response>;
  deleteAll(req: ServerRequest): Promise<Response>;
}

// Interface for request body parsing
export interface IRequestBodyParser {
  parseRequestBody<U>(req: ServerRequest): Promise<U>;
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}
