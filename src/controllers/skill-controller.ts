import { Collection, ObjectId } from "mongodb";
import type { RequestWithPagination } from "../config/interfaces/i-pagination";
import type { ServerRequest } from "../config/interfaces/i-request";
import { authMiddleware } from "../middleware/aut-middleware";
import { paginationMiddleware } from "../middleware/pagination-middleware";
import { CollectionsManager } from "../models/base/collection-manager";
import type { Skill } from "../models/skill";
import { CertificationRepository } from "../repositories/certification-repository";
import { SkillRepository } from "../repositories/skill-repository";
import { userRepository } from "../repositories/user-repository";
import { Get, Post } from "../routes/router-manager";
import { SkillService } from "../services/skill-service";
import { ResponseHelper } from "../utils/response-helper";
import { BaseController } from "./base/base-controller";
interface SkillUploadPayload {
  categorie: string;
  name: string;
  level: string;
  certificationFiles: File[];
}

export class SkillController extends BaseController<Skill, SkillService> {
  protected createService(): SkillService {
    return new SkillService(
      new SkillRepository(),
      new userRepository(),
      new CertificationRepository(),
    );
  }

  constructor() {
    super("/skill");
    this.initializeService(this.createService());
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
  @Post("/add-skill", [authMiddleware])
  async addSkill(req: ServerRequest): Promise<Response> {
    try {
      const formData = (await req.formData()) as FormData;
      const certifNames: string[] = formData.getAll("certifNames").map(String);
      formData.delete("certifNames");
      const body = await this.parseFormData<Skill>(formData);
      return this.service.createOneSkill(body, formData, certifNames);
    } catch (err) {
      return ResponseHelper.serverError(String(err));
    }
  }

  @Post("/add-many-skill", [authMiddleware])
  async addManySkill(req: ServerRequest): Promise<Response> {
    try {
      const formData = (await req.formData()) as FormData;
      const skills: SkillUploadPayload[] = [];
      const certifNamesList: string[][] = [];

      // Parse fields and build skills[]
      for (const [key, value] of formData.entries()) {
        const match = key.match(/^skills\[(\d+)]\[(\w+)](\[\])?$/);
        if (!match) continue;

        const index = parseInt(String(match[1]));
        const field = match[2];
        const isArray = !!match[3];

        // Initialize if empty
        if (!skills[index]) {
          skills[index] = {
            name: "",
            categorie: "",
            level: "",
            certificationFiles: [],
          };
          certifNamesList[index] = [];
        }

        // Handle fields
        if (field === "certifications" && isArray) {
          if (
            typeof value === "object" &&
            value !== null &&
            typeof (value as Blob).arrayBuffer === "function"
          ) {
            skills[index].certificationFiles.push(value as File);
          }
        } else if (
          field === "certifNames" &&
          isArray &&
          typeof value === "string"
        ) {
          if (!certifNamesList[index]) continue;
          certifNamesList[index].push(value);
        } else if (!isArray && typeof value === "string") {
          if (field === "name" || field === "categorie" || field === "level") {
            skills[index][field] = value;
          }
        }
      }

      // Get userId from auth middleware
      if (!req.user || !req.user._id || !ObjectId.isValid(req.user._id)) {
        return ResponseHelper.error("Invalid or missing user ID");
      }

      const userId = new ObjectId(req.user._id);
      const skillDocs: Skill[] = [];

      for (const skill of skills) {
        if (!skill) continue;

        skillDocs.push({
          userId,
          name: skill.name,
          categorie: skill.categorie,
          level: skill.level,
          certifications: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      return this.service.createManySkills(
        skillDocs,
        formData,
        certifNamesList,
      );
    } catch (err) {
      return ResponseHelper.serverError(`Failed to add skills: ${String(err)}`);
    }
  }
}
