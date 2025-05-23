import type { ExpressMiddleware } from "../types/route-types";

export class MiddlewareExecutor {
  static isResponse(value: unknown): value is Response {
    return value instanceof Response;
  }

  static isRequest(value: unknown): value is Request {
    return value instanceof Request;
  }

  static async executeMiddlewareChain(
    middlewareChain: Array<ExpressMiddleware>,
    req: Request,
  ): Promise<Request | Response> {
    let currentRequest = req;

    for (const middleware of middlewareChain) {
      const result = await middleware(currentRequest);

      if (this.isResponse(result)) {
        return result;
      }

      if (this.isRequest(result)) {
        currentRequest = result;
      }
    }

    return currentRequest;
  }
}
