import type { Skill } from "../../models/skill";

export interface ISkillService {
  createOneSkill(
    skill: Skill,
    formData: FormData,
    certifName: string[],
  ): Promise<Response>;
}
