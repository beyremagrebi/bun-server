import { ObjectId } from "mongodb";
import type { MyJwtPayload } from "../../utils/interfaces/i-j-w-t";

export interface ITokenService {
  generateAccessToken(userId: ObjectId | undefined): string;
  generateRefreshToken(userId: ObjectId | undefined): string;
  verifyToken(token: string): Promise<MyJwtPayload>;
}
