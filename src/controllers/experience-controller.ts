import { Collection } from "mongodb";
import { CollectionsManager } from "../models/base/collection-manager";
import type { Experience } from "../models/experience";
import { ExperienceServices } from "../services/experience-services";
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
}
