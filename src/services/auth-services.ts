import { ObjectId } from "mongodb";
import type { IAuthService } from "../interfaces/auth/i-auth-service";
import type { IRefreshTokenRepository } from "../interfaces/auth/i-refresh-token-repository";
import type { ITokenService } from "../interfaces/auth/i-token-service";
import type { IUserRepository } from "../interfaces/user/i-user-repository";
import type { RefreshToken } from "../models/refresh-token";
import { ResponseHelper } from "../utils/response-helper";

export class AuthService implements IAuthService {
  constructor(
    private userRepository: IUserRepository,
    private refreshTokenRepository: IRefreshTokenRepository,
    private tokenService: ITokenService,
  ) {}

  async login(
    identifier: string | undefined,
    password: string,
  ): Promise<Response> {
    if (!identifier) {
      return ResponseHelper.error("Email or username is required", 400);
    }

    const user = await this.userRepository.findByIdentifier(identifier);
    if (!user) {
      return ResponseHelper.error("User not found", 404);
    }

    const isMatch = await Bun.password.verify(password, user.password);
    if (!isMatch) {
      return ResponseHelper.error("Invalid password", 401);
    }

    const userId = new ObjectId(user._id);

    const existingSession =
      await this.refreshTokenRepository.findByUserId(userId);

    const accessToken = this.tokenService.generateAccessToken(user._id);
    const refreshToken = this.tokenService.generateRefreshToken(user._id);

    if (existingSession) {
      existingSession.token = refreshToken;
      existingSession.updatedAt = new Date();

      await this.refreshTokenRepository.update(existingSession);
    } else {
      const refreshTokenData: RefreshToken = {
        userId: userId,
        token: refreshToken,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await this.refreshTokenRepository.create(refreshTokenData);
    }

    return ResponseHelper.success({
      accessToken,
      refreshToken,
      userId: user._id,
    });
  }

  async logout(token: string | null): Promise<Response> {
    if (!token) {
      return ResponseHelper.error("could not get token", 400);
    }

    const payload = await this.tokenService.verifyToken(token);
    await this.refreshTokenRepository.deleteByUserId(
      new ObjectId(String(payload.id)),
    );

    return ResponseHelper.success({ message: "Logged out successfully" });
  }

  async refreshToken(refreshToken: string): Promise<Response> {
    if (!refreshToken) {
      return ResponseHelper.error("Refresh token is required", 400);
    }

    const payload = await this.tokenService.verifyToken(refreshToken);
    const tokenDoc =
      await this.refreshTokenRepository.findByToken(refreshToken);

    if (!tokenDoc) {
      return ResponseHelper.error("Refresh token not found", 403);
    }

    const userId = new ObjectId(String(payload.id));
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return ResponseHelper.error("User no longer exists", 404);
    }

    await this.refreshTokenRepository.deleteByToken(refreshToken);

    const newAccessToken = this.tokenService.generateAccessToken(user._id);
    const newRefreshToken = this.tokenService.generateRefreshToken(user._id);

    await this.refreshTokenRepository.create({
      userId: userId,
      token: newRefreshToken,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return ResponseHelper.success({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  }
}
