import type { Experience } from "../../models/experience";

export interface IExerienceRepository {
  addExperience(experinec: Experience): Promise<void>;
}
