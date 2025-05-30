import type {
  ICRUDController,
  IRequestBodyParser,
} from "../../interfaces/user/i-crud-controller";

import type {
  Collection,
  Filter,
  ObjectId,
  OptionalUnlessRequiredId,
} from "mongodb";
import type { RequestWithPagination } from "../../config/interfaces/i-pagination";
import type { ServerRequest } from "../../config/interfaces/i-request";
import { autoPaginateResponse } from "../../middleware/pagination-middleware";
import type { BaseModel } from "../../models/base/base-model";
import { Get, Post } from "../../routes/router-manager";
import { ResponseHelper } from "../../utils/response-helper";

export abstract class BaseController<T extends BaseModel>
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
  async getById(_id: ObjectId): Promise<Response> {
    try {
      const filter = { _id } as Filter<T>;
      const data = await this.collection.findOne(filter);

      if (!data) {
        return ResponseHelper.notFound("Data not found");
      }

      return ResponseHelper.success(data);
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
      const json = await req.originalRequest.json();
      return json as U;
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
