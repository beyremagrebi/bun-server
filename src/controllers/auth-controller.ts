import { type Collection, type OptionalUnlessRequiredId } from "mongodb";

import type { ServerRequest } from "../config/interfaces/i-request";
import { authMiddleware } from "../middleware/aut-middleware";
import { CollectionsManager } from "../models/base/collection-manager";
import type { RefreshToken } from "../models/refresh-token";
import type { User } from "../models/user";
import { RefreshTokenRepository } from "../repositories/refresh-token-repository";

import { Get, Post, Put } from "../routes/router-manager";
import { AuthService } from "../services/auth-services";

import { EmailVerificationTokenRespository } from "../repositories/email-verification-token-repository";
import { otpVerificationRepository } from "../repositories/otp-verification-repository";
import { userRepository } from "../repositories/user-repository";
import { getTokenFromHeaders } from "../utils/auth";
import { ResponseHelper } from "../utils/response-helper";
import { BaseController } from "./base/base-controller";

class AuthController extends BaseController<RefreshToken, AuthService> {
  constructor() {
    super("/auth");
  }

  protected createService(): AuthService {
    return new AuthService(
      new userRepository(),
      new RefreshTokenRepository(),
      new otpVerificationRepository(),
      new EmailVerificationTokenRespository(),
    );
  }

  protected initializeCollection(): Collection<RefreshToken> {
    return CollectionsManager.refreshCollection;
  }

  @Post("/login")
  async login(req: ServerRequest): Promise<Response> {
    try {
      const body = await this.parseRequestBody<{
        identifier: string;
        password: string;
      }>(req);

      return this.service.login(body.identifier, body.password);
    } catch (err) {
      return ResponseHelper.error(String(err));
    }
  }

  @Post("/logout", [authMiddleware])
  async logout(req: ServerRequest): Promise<Response> {
    try {
      const token = getTokenFromHeaders(req.headers);
      return this.service.logout(token);
    } catch (err) {
      return ResponseHelper.serverError(String(err));
    }
  }

  @Post("/refreshToken")
  async refreshToken(req: ServerRequest): Promise<Response> {
    try {
      const body = await this.parseRequestBody<{ refreshToken: string }>(req);
      return this.service.refreshToken(body.refreshToken);
    } catch (err) {
      return ResponseHelper.serverError(String(err));
    }
  }

  @Post("/send-otp/:email")
  async sendOtp(req: ServerRequest): Promise<Response> {
    try {
      return this.service.sendOtp(String(req.params.email));
    } catch (err) {
      return ResponseHelper.serverError(String(err));
    }
  }

  @Post("/verify-otp/:otp")
  async verifyOtp(req: ServerRequest): Promise<Response> {
    try {
      const body =
        await this.parseRequestBody<OptionalUnlessRequiredId<User>>(req);

      return this.service.verifyOtp(String(req.params.otp), body);
    } catch (err) {
      return ResponseHelper.serverError(String(err));
    }
  }
  @Post("/forget-password/:email")
  async forgetPassword(req: ServerRequest): Promise<Response> {
    try {
      return this.service.forgetPassword(String(req.params.email));
    } catch (err) {
      return ResponseHelper.serverError(String(err));
    }
  }

  @Get("/validate-reset-token/:token")
  async validateResetToken(req: ServerRequest): Promise<Response> {
    try {
      return this.service.validateResetToken(String(req.params.token));
    } catch (err) {
      return ResponseHelper.serverError(String(err));
    }
  }
  @Put("/change-password/:token")
  async createNewPassword(req: ServerRequest): Promise<Response> {
    try {
      const body = await this.parseRequestBody<{ password: string }>(req);
      if (!body.password) {
        return ResponseHelper.error("Password is required");
      }

      const token = String(req.params.token);
      const newPassword = body.password;

      return this.service.createNewPassword(token, newPassword);
    } catch (err) {
      return ResponseHelper.serverError(String(err));
    }
  }
}

export default AuthController;
