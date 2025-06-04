import type { ObjectId } from "mongodb";
import type { Experience } from "../../models/experience";

export interface IExperienceService {
  addExperience(
    userId: ObjectId,
    experinec: Experience,
    formData: FormData,
  ): Promise<Response>;
}
