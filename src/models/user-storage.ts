import type { ObjectId } from "mongodb";
import type { BaseModel } from "./base/base-model";

export interface UserStorage extends BaseModel {
  userId: ObjectId;
  usedStorage: number;
  readableSize: string;
  maxStorage: number;
}
