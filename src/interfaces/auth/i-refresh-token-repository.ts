import { ObjectId } from "mongodb";
import type { RefreshToken } from "../../models/refresh-token";

export interface IRefreshTokenRepository {
  create(tokenData: RefreshToken): Promise<void>;
  deleteByUserId(userId: ObjectId): Promise<void>;
  deleteByToken(token: string): Promise<void>;
  findByToken(token: string): Promise<RefreshToken | null>;
  findByUserId(userId: ObjectId): Promise<RefreshToken | null>;
}
