import type { ObjectId } from "mongodb";
import type { BaseModel } from "./base/base-model";

export interface RefreshToken extends BaseModel {
  userId: ObjectId;
  token: string;
}
