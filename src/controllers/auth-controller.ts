import { type Collection, type OptionalUnlessRequiredId } from "mongodb";

import type { ServerRequest } from "../config/interfaces/i-request";
import { authMiddleware } from "../middleware/aut-middleware";
import { CollectionsManager } from "../models/base/collection-manager";
import type { RefreshToken } from "../models/refresh-token";
import type { User } from "../models/user";
import { RefreshTokenRepository } from "../repositories/refresh-token-repository";
import { UserRepository } from "../repositories/user-repository";
import { Post } from "../routes/router-manager";
import { AuthService } from "../services/auth-services";
import { TokenService } from "../services/token-service";
import { getTokenFromHeaders } from "../utils/auth";
import { ResponseHelper } from "../utils/response-helper";
import { BaseController } from "./base/base-controller";

class AuthController extends BaseController<RefreshToken> {
  private authService: AuthService;

  constructor() {
    super("/auth");
    this.authService = new AuthService(
      new UserRepository(),
      new RefreshTokenRepository(),
      new TokenService(),
    );
  }

  protected initializeCollection(): Collection<RefreshToken> {
    return CollectionsManager.refreshCollection;
  }

  @Post("/login")
  async login(req: ServerRequest): Promise<Response> {
    try {
      const body =
        await this.parseRequestBody<OptionalUnlessRequiredId<User>>(req);
      return this.authService.login(body.identifier, body.password);
    } catch (err) {
      return ResponseHelper.error(String(err));
    }
  }

  @Post("/logout", [authMiddleware])
  async logout(req: ServerRequest): Promise<Response> {
    try {
      const token = getTokenFromHeaders(req.headers);
      return this.authService.logout(token);
    } catch (err) {
      return ResponseHelper.error(String(err));
    }
  }

  @Post("/refreshToken")
  async refreshToken(req: ServerRequest): Promise<Response> {
    try {
      const body = await this.parseRequestBody<{ refreshToken: string }>(req);
      return this.authService.refreshToken(body.refreshToken);
    } catch (err) {
      return ResponseHelper.error(String(err), 500);
    }
  }
}

export default AuthController;
