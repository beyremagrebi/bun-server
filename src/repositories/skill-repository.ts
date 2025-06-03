import type { ObjectId } from "mongodb";
import type { ISkillRepository } from "../interfaces/skill/i-skill-repository";
import { CollectionsManager } from "../models/base/collection-manager";
import type { Skill } from "../models/skill";

export class SkillRepository implements ISkillRepository {
  async findById(skillId: ObjectId): Promise<Skill | null> {
    return await this.collection.findOne({ _id: skillId });
  }
  async findByName(skillName: string): Promise<Skill | null> {
    return await this.collection.findOne({ name: skillName });
  }
  private collection = CollectionsManager.skillCollection;

  async createSkill(skill: Skill): Promise<void> {
    await this.collection.insertOne(skill);
  }

  async createManySkills(skills: Skill[]): Promise<void> {
    await this.collection.insertMany(skills);
  }
}
