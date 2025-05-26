import type { ObjectId } from "mongodb";
import type { IOtpVerificationRepository } from "../interfaces/auth/i-otp--verification-repository";
import { CollectionsManager } from "../models/base/collection-manager";
import type { OtpVerification } from "../models/otp-verification";

export class otpVerificationRepository implements IOtpVerificationRepository {
  private collection = CollectionsManager.otpCollection;

  async create(otpData: OtpVerification): Promise<void> {
    await this.collection.insertOne(otpData);
  }

  async findbyOtpCode(otpCode: string): Promise<OtpVerification | null> {
    return await this.collection.findOne({ otp: otpCode });
  }

  async update(otpData: OtpVerification): Promise<void> {
    await this.collection.updateOne({ _id: otpData._id }, { $set: otpData });
  }
  async deleteById(id: ObjectId): Promise<void> {
    await this.collection.deleteOne({ _id: id });
  }
}
