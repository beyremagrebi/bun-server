// token-service.ts
import { ObjectId } from "mongodb";
import type { ITokenService } from "../interfaces/auth/i-token-service";
import type { MyJwtPayload } from "../utils/interfaces/i-j-w-t";
import { generateToken, verifyToken } from "../utils/j-w-t";
import { EnvLoader } from "../config/env";

class TokenService implements ITokenService {
  private static instance: TokenService;

  private constructor() {}

  public static getInstance(): TokenService {
    if (!TokenService.instance) {
      TokenService.instance = new TokenService();
    }
    return TokenService.instance;
  }

  generateAccessToken(userId: ObjectId | undefined): string {
    return generateToken({ _id: userId }, EnvLoader.ExpAccssToken);
  }

  generateRefreshToken(userId: ObjectId | undefined): string {
    return generateToken({ _id: userId }, EnvLoader.ExpRefreshToken);
  }

  async verifyToken(token: string): Promise<MyJwtPayload> {
    return (await verifyToken(token)) as MyJwtPayload;
  }
}

export const tokenService = TokenService.getInstance();
