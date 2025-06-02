import type { ISkillRepository } from "../interfaces/skill/i-skill-repository";
import type { Skill } from "../models/skill";

export class SkillRepository implements ISkillRepository {
  createSkill(): Promise<Skill> {
    throw new Error("Method not implemented.");
  }
}
