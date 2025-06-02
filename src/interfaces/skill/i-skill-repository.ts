import type { Skill } from "../../models/skill";

export interface ISkillRepository {
  createSkill(): Promise<Skill>;
}
