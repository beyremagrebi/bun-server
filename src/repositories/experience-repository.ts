import type { IExerienceRepository } from "../interfaces/experience/i-experience-repository";
import { CollectionsManager } from "../models/base/collection-manager";
import type { Experience } from "../models/experience";

export class ExperienceRepository implements IExerienceRepository {
  private collection = CollectionsManager.experienceCollection;
  async addExperience(experience: Experience): Promise<void> {
    await this.collection.insertOne(experience);
  }
}
