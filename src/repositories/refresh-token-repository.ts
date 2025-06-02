import { ObjectId } from "mongodb";
import type { IRefreshTokenRepository } from "../interfaces/auth/repo/i-refresh-token-repository";
import { CollectionsManager } from "../models/base/collection-manager";
import type { RefreshToken } from "../models/refresh-token";

export class RefreshTokenRepository implements IRefreshTokenRepository {
  private collection = CollectionsManager.refreshCollection;

  async create(tokenData: RefreshToken): Promise<void> {
    await this.collection.insertOne(tokenData);
  }

  async deleteByUserId(userId: ObjectId): Promise<void> {
    await this.collection.deleteMany({ userId });
  }

  async deleteByToken(token: string): Promise<void> {
    await this.collection.deleteOne({ token });
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    return this.collection.findOne({ token });
  }

  async findByUserId(userId: ObjectId): Promise<RefreshToken | null> {
    return this.collection.findOne({ userId });
  }

  async update(tokenData: RefreshToken): Promise<void> {
    await this.collection.updateOne(
      { _id: tokenData._id },
      { $set: tokenData },
    );
  }
}
