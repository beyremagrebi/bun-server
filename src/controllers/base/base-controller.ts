import type { Collection, Document, OptionalUnlessRequiredId } from "mongodb";
import type {
  ICRUDController,
  IRequestBodyParser,
} from "../../interfaces/user/i-crud-controller";

import type { RequestWithPagination } from "../../config/interfaces/i-pagination";
import type { ServerRequest } from "../../config/interfaces/i-request";
import { autoPaginateResponse } from "../../middleware/pagination-middleware";
import { Get, Post } from "../../routes/router-manager";
import { ResponseHelper } from "../../utils/response-helper";

export abstract class BaseController<T extends Document>
  implements ICRUDController, IRequestBodyParser
{
  protected collection: Collection<T>;
  public basePath: string;

  constructor(basePath: string) {
    this.collection = this.initializeCollection();
    this.basePath = basePath;
  }

  protected abstract initializeCollection(): Collection<T>;

  @Get("/")
  async getAll(req: RequestWithPagination): Promise<Response> {
    try {
      const pagination = req.pagination;
      let cursor = this.collection.find();

      if (pagination) {
        cursor = cursor.skip(pagination.skip).limit(pagination.take);
      }

      return autoPaginateResponse(
        req,
        cursor.toArray(),
        this.collection.countDocuments(),
      );
    } catch (error) {
      return ResponseHelper.serverError(String(error));
    }
  }

  @Post("/")
  async create(req: ServerRequest): Promise<Response> {
    try {
      const body =
        await this.parseRequestBody<OptionalUnlessRequiredId<T>>(req);
      const { insertedId } = await this.collection.insertOne(body);
      return ResponseHelper.success({ id: insertedId, ...body });
    } catch (error) {
      return ResponseHelper.serverError(String(error));
    }
  }

  async getById(req: ServerRequest): Promise<Response> {
    try {
      // await this.collection.findOne({_id : id});
      return ResponseHelper.success(req);
    } catch (error) {
      return ResponseHelper.serverError(String(error));
    }
  }

  async deleteAll(req: ServerRequest): Promise<Response> {
    try {
      await this.collection.deleteMany();
      return ResponseHelper.success("sucess delete " + req.url);
    } catch (error) {
      return ResponseHelper.serverError(String(error));
    }
  }

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

  async parseFormData<U>(formData: FormData): Promise<U> {
    try {
      const formObject: Record<string, string> = {};
      for (const [key, value] of formData.entries()) {
        formObject[key] = value;
      }

      return formObject as unknown as U;
    } catch (err) {
      console.error("Error parsing request body:", err);
      throw new Error("Invalid request body format");
    }
  }
}
