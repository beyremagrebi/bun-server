import type { ServerRequest } from "../config/interfaces/i-request";
import type { IRequestBodyParser } from "../interfaces/base/i-crud-controller";

export class RequestBodyParser implements IRequestBodyParser {
  async parseRequestBody<U>(req: ServerRequest): Promise<U> {
    try {
      if (!req.body || Object.keys(req.body).length === 0) {
        const text = await req.text();
        if (!text) {
          throw new Error("Request body is empty");
        }
        return JSON.parse(text) as U;
      }
      return req.body as U;
    } catch (error) {
      console.error("Error parsing request body:", error);
      throw new Error("Invalid request body format");
    }
  }
}
