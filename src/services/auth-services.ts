import * as crypto from "crypto";
import { ObjectId, type OptionalUnlessRequiredId } from "mongodb";
import type { IAuthService } from "../interfaces/auth/i-auth-service";
import type { IOtpVerificationRepository } from "../interfaces/auth/i-otp--verification-repository";
import type { IRefreshTokenRepository } from "../interfaces/auth/i-refresh-token-repository";
import type { IUserRepository } from "../interfaces/user/i-user-repository";
import type { OtpVerification } from "../models/otp-verification";
import type { RefreshToken } from "../models/refresh-token";
import type { User } from "../models/user";
import { createUser } from "../utils/auth";
import { sendEmail } from "../utils/email-service";
import { ResponseHelper } from "../utils/response-helper";
import { tokenService } from "./token-service";
export class AuthService implements IAuthService {
  constructor(
    private userRepository: IUserRepository,
    private refreshTokenRepository: IRefreshTokenRepository,
    private otpVerificationRepository: IOtpVerificationRepository,
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

    const accessToken = tokenService.generateAccessToken(user._id);
    const refreshToken = tokenService.generateRefreshToken(user._id);

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

    const payload = await tokenService.verifyToken(token);
    await this.refreshTokenRepository.deleteByUserId(
      new ObjectId(String(payload._id)),
    );

    return ResponseHelper.success({ message: "Logged out successfully" });
  }

  async refreshToken(refreshToken: string): Promise<Response> {
    if (!refreshToken) {
      return ResponseHelper.error("Refresh token is required", 400);
    }

    const payload = await tokenService.verifyToken(refreshToken);
    const tokenDoc =
      await this.refreshTokenRepository.findByToken(refreshToken);

    if (!tokenDoc) {
      return ResponseHelper.error("Refresh token not found", 403);
    }

    const userId = new ObjectId(String(payload._id));
    const user = await this.userRepository.findById(userId, 0);

    if (!user) {
      return ResponseHelper.error("User no longer exists", 404);
    }

    await this.refreshTokenRepository.deleteByToken(refreshToken);

    const newAccessToken = tokenService.generateAccessToken(user._id);
    const newRefreshToken = tokenService.generateRefreshToken(user._id);

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

  async sendOtp(email: string): Promise<Response> {
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    const verificationUrl = "https://f94e-197-27-119-24.ngrok-free.app/verify";
    const user = await this.userRepository.findByEmail(email);
    if (user) {
      return ResponseHelper.error("User already exists with this email", 400);
    }
    const otpData: OtpVerification = {
      email: email,
      otp,
      expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await sendEmail({
      to: email,
      otp,
      verificationUrl,
    }).catch(console.error);

    await this.otpVerificationRepository.create(otpData);
    return ResponseHelper.success({ otp, expiresAt });
  }
  async verifyOtp(
    otp: string,
    userData: OptionalUnlessRequiredId<User>,
  ): Promise<Response> {
    const otpRecord = await this.otpVerificationRepository.findbyOtpCode(otp);

    if (!otpRecord) {
      return ResponseHelper.error("Invalid OTP");
    }

    const currentTime = new Date();
    if (currentTime > otpRecord.expiresAt) {
      return ResponseHelper.error("OTP expired");
    }

    await this.otpVerificationRepository.deleteById(otpRecord._id);

    return createUser(userData);
  }
}
