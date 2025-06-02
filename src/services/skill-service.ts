import type { ISkillRepository } from "../interfaces/skill/i-skill-repository";
import type { ISkillService } from "../interfaces/skill/i-skill-service";
import { CollectionsManager } from "../models/base/collection-manager";
import type { Skill } from "../models/skill";
import { BaseService } from "./base/base-service";

export class SkillService extends BaseService<Skill> implements ISkillService {
  constructor(private userRepository: ISkillRepository) {
    super(CollectionsManager.skillCollection);
  }
  createSkill(): Promise<Response> {
    throw new Error("Method not implemented.");
  }
}
