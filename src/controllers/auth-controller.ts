import type { Collection, OptionalUnlessRequiredId } from "mongodb";
import { CollectionsManager } from "../models/base/collection-manager";
import type { RefreshToken } from "../models/refresh-token";
import type { User } from "../models/user";
import type { CustomRequest } from "../routes/router";
import { Get, Post } from "../routes/router-manager";
import { generateToken } from "../utils/j-w-t";
import { ResponseHelper } from "../utils/response-helper";
import { BaseController } from "./base/base-controller";

class AuthController extends BaseController<RefreshToken> {
  constructor() {
    super("/auth");
  }
  protected initializeCollection(): Collection<RefreshToken> {
    return CollectionsManager.refreshCollection;
  }

  @Post("/login")
  async login(req: Request): Promise<Response> {
    try {
      const body =
        await this.parseRequestBody<OptionalUnlessRequiredId<User>>(req);
      const user = await CollectionsManager.userCollection.findOne({
        email: body.email,
      });
      if (!user) {
        return ResponseHelper.error("User not found", 404);
      }
      const isMatch = await Bun.password.verify(body.password, user.password);
      if (!isMatch) {
        return ResponseHelper.error("Invalid password", 401);
      }
      const accessToken = generateToken({ id: user._id });
      const refreshToken = generateToken(
        { id: user._id, beyrem: "beryem" },
        "5d",
      );
      return ResponseHelper.success({ accessToken, refreshToken });
    } catch (err) {
      return ResponseHelper.error(String(err));
    }
  }

  @Post("/logout")
  async logout(req: Request): Promise<Response> {
    try {
      return ResponseHelper.success("TODO" + String(req.url));
    } catch (err) {
      return ResponseHelper.error(String(err));
    }
  }

  @Get("/refreshToken/:hello/:ll")
  async refreshToken(req: Request): Promise<Response> {
    try {
      const { hello, ll } = (req as CustomRequest).params || {};
      return ResponseHelper.success("TODO " + String(hello) + " " + ll);
    } catch (err) {
      return ResponseHelper.error(String(err));
    }
  }
}

export default AuthController;
