import type { BaseModel } from "./base/base-model";

export interface OtpVerification extends BaseModel {
  email: string;
  otp: string;
  expiresAt: Date;
}
