import type { Collection, OptionalUnlessRequiredId } from "mongodb";
import type { ServerRequest } from "../interfaces/i-request";
import { CollectionsManager } from "../models/base/collection-manager";
import type { RefreshToken } from "../models/refresh-token";
import type { User } from "../models/user";
import { Get, Post } from "../routes/router-manager";
import { generateToken } from "../utils/j-w-t";
import { ResponseHelper } from "../utils/response-helper";
import { BaseController } from "./base/base-controller";
import { authMiddleware } from "../middleware/aut-middleware";
import validator from "validator";

class AuthController extends BaseController<RefreshToken> {
  constructor() {
    super("/auth");
  }
  protected initializeCollection(): Collection<RefreshToken> {
    return CollectionsManager.refreshCollection;
  }

  @Post("/login")
  async login(req: ServerRequest): Promise<Response> {
    try {
      const body =
        await this.parseRequestBody<OptionalUnlessRequiredId<User>>(req);

      if (!body.identifier) {
        return ResponseHelper.error("Email or username is required", 400);
      }

      let isEmail = false;
      if (validator.isEmail(body.identifier)) {
        isEmail = true;
      }
      const query: { email?: string; userName?: string } = {};

      if (isEmail) {
        query.email = body.identifier;
      } else {
        query.userName = body.identifier;
      }

      const user = await CollectionsManager.userCollection.findOne(query);

      if (!user) {
        return ResponseHelper.error("User not found", 404);
      }

      const isMatch = await Bun.password.verify(body.password, user.password);
      if (!isMatch) {
        return ResponseHelper.error("Invalid password", 401);
      }

      const accessToken = generateToken({ id: user._id });
      const refreshToken = generateToken({ id: user._id }, "5d");

      return ResponseHelper.success({ accessToken, refreshToken });
    } catch (err) {
      return ResponseHelper.error(String(err));
    }
  }

  @Post("/logout", [authMiddleware])
  async logout(req: ServerRequest): Promise<Response> {
    try {
      return ResponseHelper.success(req);
    } catch (err) {
      return ResponseHelper.error(String(err));
    }
  }

  @Get("/refreshToken")
  async refreshToken(req: ServerRequest): Promise<Response> {
    try {
      return ResponseHelper.success(req);
    } catch (err) {
      return ResponseHelper.error(String(err));
    }
  }
}

export default AuthController;
