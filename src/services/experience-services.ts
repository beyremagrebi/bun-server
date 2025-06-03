import { CollectionsManager } from "../models/base/collection-manager";
import type { Experience } from "../models/experience";
import { BaseService } from "./base/base-service";

export class ExperienceServices extends BaseService<Experience> {
  constructor() {
    super(CollectionsManager.experienceCollection);
  }
}
