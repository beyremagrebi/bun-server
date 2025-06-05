import type { ObjectId } from "mongodb";
import type { BaseModel } from "./base/base-model";

export interface Skill extends BaseModel {
  userId: ObjectId;
  categorie: string; // enum
  name: string;
  level: string; // enum
  percentage: number;
  certifications: ObjectId[];
}
