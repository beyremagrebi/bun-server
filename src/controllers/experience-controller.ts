import { Collection } from "mongodb";
import type { RequestWithPagination } from "../config/interfaces/i-pagination";
import type { ServerRequest } from "../config/interfaces/i-request";
import { authMiddleware } from "../middleware/aut-middleware";
import { paginationMiddleware } from "../middleware/pagination-middleware";
import { CollectionsManager } from "../models/base/collection-manager";
import type { Experience } from "../models/experience";
import { Get, Post } from "../routes/router-manager";
import { ExperienceServices } from "../services/experience-services";
import { ResponseHelper } from "../utils/response-helper";
import { BaseController } from "./base/base-controller";

export class ExperienceController extends BaseController<
  Experience,
  ExperienceServices
> {
  constructor() {
    super("/experience");
    this.initializeService(this.createService());
  }
  protected initializeCollection(): Collection<Experience> {
    return CollectionsManager.experienceCollection;
  }
  protected createService(): ExperienceServices {
    return new ExperienceServices();
  }

  @Get("/getAll", [authMiddleware, paginationMiddleware])
  async getAll(req: RequestWithPagination): Promise<Response> {
    try {
      return super.getAll(req);
    } catch (err) {
      return ResponseHelper.serverError(String(err));
    }
  }

  @Post("/add-experience", [authMiddleware, paginationMiddleware])
  async addExperience(req: ServerRequest): Promise<Response> {
    try {
      const formData = (await req.formData()) as FormData;
      const body = await this.parseFormData(formData);
      return ResponseHelper.success(body);
    } catch (err) {
      return ResponseHelper.serverError(String(err));
    }
  }
}
