import type { Collection, Document, OptionalUnlessRequiredId } from "mongodb";
import { Get, Post } from "../../routes/router-manager";
import { ResponseHelper } from "../../utils/response-helper";

export abstract class BaseController<T extends Document> {
  protected collection: Collection<T>;
  public basePath: string;

  constructor(basePath: string) {
    this.collection = this.initializeCollection();
    this.basePath = basePath;
  }

  protected abstract initializeCollection(): Collection<T>;

  @Get("/")
  async getAll(): Promise<Response> {
    try {
      const items = await this.collection.find().toArray();
      return ResponseHelper.success(items);
    } catch (error) {
      return ResponseHelper.serverError(String(error));
    }
  }

  @Post("/")
  async create(req: Request): Promise<Response> {
    try {
      const body =
        await this.parseRequestBody<OptionalUnlessRequiredId<T>>(req);
      const { insertedId } = await this.collection.insertOne(body);
      return ResponseHelper.success({ id: insertedId, ...body });
    } catch (error) {
      return ResponseHelper.serverError(String(error));
    }
  }

  protected async parseRequestBody<U>(req: Request): Promise<U> {
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
