import { ObjectId } from "mongodb";
import type { ITokenService } from "../interfaces/auth/i-token-service";
import type { MyJwtPayload } from "../utils/interfaces/i-j-w-t";
import { generateToken, verifyToken } from "../utils/j-w-t";

export class TokenService implements ITokenService {
  generateAccessToken(userId: ObjectId): string {
    return generateToken({ id: userId });
  }

  generateRefreshToken(userId: ObjectId): string {
    return generateToken({ id: userId }, "5d");
  }

  async verifyToken(token: string): Promise<MyJwtPayload> {
    return (await verifyToken(token)) as MyJwtPayload;
  }
}
