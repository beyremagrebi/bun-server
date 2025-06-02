import type { ObjectId } from "mongodb";
import type { OtpVerification } from "../../models/otp-verification";

export interface IOtpVerificationRepository {
  create(otpData: OtpVerification): Promise<void>;
  update(otpData: OtpVerification): Promise<void>;
  deleteById(id: ObjectId | undefined): Promise<void>;
  findbyOtpCode(otpCode: string): Promise<OtpVerification | null>;
}
