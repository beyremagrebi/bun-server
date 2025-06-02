import { Collection } from "mongodb";
import type { RequestWithPagination } from "../config/interfaces/i-pagination";
import { authMiddleware } from "../middleware/aut-middleware";
import { paginationMiddleware } from "../middleware/pagination-middleware";
import { CollectionsManager } from "../models/base/collection-manager";
import type { Skill } from "../models/skill";
import { SkillRepository } from "../repositories/skill-repository";
import { Get } from "../routes/router-manager";
import { SkillService } from "../services/skill-service";
import { ResponseHelper } from "../utils/response-helper";
import { BaseController } from "./base/base-controller";

export class SkillController extends BaseController<Skill, SkillService> {
  protected createService(): SkillService {
    return new SkillService(new SkillRepository());
  }

  constructor(private readonly skillService: SkillService) {
    super("/skill");
    this.service = skillService;
  }
  protected initializeCollection(): Collection<Skill> {
    return CollectionsManager.skillCollection;
  }
  @Get("/getAll", [authMiddleware, paginationMiddleware])
  async getAll(req: RequestWithPagination): Promise<Response> {
    try {
      return super.getAll(req);
    } catch (err) {
      return ResponseHelper.serverError(String(err));
    }
  }

  @Get("/add-skill", [authMiddleware, paginationMiddleware])
  async addSkill(): Promise<Response> {
    try {
      return this.service.createSkill();
    } catch (err) {
      return ResponseHelper.serverError(String(err));
    }
  }
}
