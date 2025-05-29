import type { ObjectId } from "mongodb";
import type { IEmailVerificationRepository } from "../interfaces/auth/i-email-verification-token-repository";
import { CollectionsManager } from "../models/base/collection-manager";
import type { EmailVerificationToken } from "../models/email-verification-token";

export class EmailVerificationTokenRespository
  implements IEmailVerificationRepository
{
  async deleteAll(userId: ObjectId | undefined): Promise<void> {
    await CollectionsManager.emailVerfificationTokenCollection.deleteMany({
      userId: userId,
    });
  }

  async create(data: EmailVerificationToken): Promise<void> {
    await CollectionsManager.emailVerfificationTokenCollection.insertOne(data);
  }

  async findByTokenHash(
    hashedToken: string,
  ): Promise<EmailVerificationToken | null> {
    const emailVerification =
      await CollectionsManager.emailVerfificationTokenCollection.findOne({
        tokenHash: hashedToken,
      });
    return emailVerification;
  }
}
