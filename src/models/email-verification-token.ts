import type { ObjectId } from "mongodb";
import type { BaseModel } from "./base/base-model";

export interface EmailVerificationToken extends BaseModel {
  userId?: ObjectId;
  tokenHash: string;
  expiresAt: Date;
}
