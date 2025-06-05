import type { ObjectId } from "mongodb";
import type { Experience } from "../../models/experience";

export interface IExperienceService {
  addExperience(
    userId: ObjectId,
    experience: Experience,
    formData: FormData,
  ): Promise<Response>;

  updateExperience(
    userId: ObjectId,
    experience: Experience,
    formData: FormData,
  ): Promise<Response>;
}
