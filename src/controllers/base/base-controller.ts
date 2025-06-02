import type { Collection, ObjectId, OptionalUnlessRequiredId } from "mongodb";
import type { RequestWithPagination } from "../../config/interfaces/i-pagination";
import type { ServerRequest } from "../../config/interfaces/i-request";
import type {
  ICRUDController,
  IRequestBodyParser,
} from "../../interfaces/base/i-crud-controller";
import { autoPaginateResponse } from "../../middleware/pagination-middleware";
import type { BaseModel } from "../../models/base/base-model";
import { Get, Post } from "../../routes/router-manager";
import type { BaseService } from "../../services/base/base-service";
import { ResponseHelper } from "../../utils/response-helper";

export abstract class BaseController<
    T extends BaseModel,
    S extends BaseService<T> = BaseService<T>,
  >
  implements ICRUDController, IRequestBodyParser
{
  protected collection: Collection<T>;
  protected service!: S;
  public basePath: string;

  constructor(basePath: string) {
    this.basePath = basePath;
    this.collection = this.initializeCollection();
  }

  protected abstract initializeCollection(): Collection<T>;
  protected abstract createService(): S;

  protected initializeService(service: S) {
    this.service = service;
  }

  @Get("/")
  async getAll(req: RequestWithPagination): Promise<Response> {
    try {
      const pagination = req.pagination;
      const dataPromise = this.service.getAll(
        pagination?.skip,
        pagination?.take,
      );
      const totalCount = this.service.countAll();
      return autoPaginateResponse(req, dataPromise, totalCount);
    } catch (error) {
      return ResponseHelper.serverError(String(error));
    }
  }

  @Post("/")
  async create(req: ServerRequest): Promise<Response> {
    try {
      const body =
        await this.parseRequestBody<OptionalUnlessRequiredId<T>>(req);
      const { insertedId, data } = await this.service.create(body);
      return ResponseHelper.success({ id: insertedId, ...data });
    } catch (error) {
      return ResponseHelper.serverError(String(error));
    }
  }

  async getById(_id: ObjectId): Promise<Response> {
    try {
      const data = await this.service.getById(_id);
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
      await this.service.deleteAll();
      return ResponseHelper.success(
        "Successfully deleted all data from: " + req.url,
      );
    } catch (error) {
      return ResponseHelper.serverError(String(error));
    }
  }

  async parseRequestBody<U>(req: ServerRequest): Promise<U> {
    try {
      const json = await req.json();
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
      console.error("Error parsing form data:", err);
      throw new Error("Invalid form data format");
    }
  }
}
