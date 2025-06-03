import type { ObjectId } from "mongodb";
import type { BaseModel } from "./base/base-model";

export interface Experience extends BaseModel {
  userId: ObjectId;
  post: string;
  enterprise: string;
  place: string;
  startDate: Date;
  endDate: Date;
  KeyAchievements: string;
  certificates: ObjectId[];
}
