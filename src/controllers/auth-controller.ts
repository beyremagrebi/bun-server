import {
  ObjectId,
  type Collection,
  type OptionalUnlessRequiredId,
} from "mongodb";
import validator from "validator";
import type { MyJwtPayload } from "../interfaces/i-j-w-t";
import type { ServerRequest } from "../interfaces/i-request";
import { authMiddleware } from "../middleware/aut-middleware";
import { CollectionsManager } from "../models/base/collection-manager";
import type { RefreshToken } from "../models/refresh-token";
import type { User } from "../models/user";
import { Post } from "../routes/router-manager";
import { getTokenFromHeaders } from "../utils/auth";
import { generateToken, verifyToken } from "../utils/j-w-t";
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
  async login(req: ServerRequest): Promise<Response> {
    try {
      const body =
        await this.parseRequestBody<OptionalUnlessRequiredId<User>>(req);

      if (!body.identifier) {
        return ResponseHelper.error("Email or username is required", 400);
      }

      const isEmail = validator.isEmail(body.identifier);
      const query = isEmail
        ? { email: body.identifier }
        : { userName: body.identifier };

      const user = await CollectionsManager.userCollection.findOne(query);

      if (!user) {
        return ResponseHelper.error("User not found", 404);
      }

      const isMatch = await Bun.password.verify(body.password, user.password);
      if (!isMatch) {
        return ResponseHelper.error("Invalid password", 401);
      }
      const existingSession = await this.collection.findOne({
        userId: user._id,
      });
      if (existingSession) {
        return ResponseHelper.error("User already has an active session", 409);
      }

      const accessToken = generateToken({ id: user._id });
      const refreshToken = generateToken({ id: user._id }, "5d");

      const refreshTokenData: RefreshToken = {
        userId: user._id,
        token: refreshToken,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await this.collection.insertOne(refreshTokenData);

      return ResponseHelper.success({
        accessToken,
        refreshToken,
        userId: user._id,
      });
    } catch (err) {
      return ResponseHelper.error(String(err));
    }
  }

  @Post("/logout", [authMiddleware])
  async logout(req: ServerRequest): Promise<Response> {
    try {
      const token = getTokenFromHeaders(req.headers);
      if (!token) {
        return ResponseHelper.error("could not get token", 400);
      }

      const payload: MyJwtPayload = (await verifyToken(token)) as MyJwtPayload;

      await this.collection.deleteMany({
        userId: new ObjectId(String(payload.id)),
      });

      return ResponseHelper.success({ message: "Logged out successfully" });
    } catch (err) {
      return ResponseHelper.error(String(err));
    }
  }

  @Post("/refreshToken")
  async refreshToken(req: ServerRequest): Promise<Response> {
    try {
      const body = await this.parseRequestBody<{ refreshToken: string }>(req);

      if (!body.refreshToken) {
        return ResponseHelper.error("Refresh token is required", 400);
      }

      const token = body.refreshToken;

      const payload: MyJwtPayload = (await verifyToken(token)) as MyJwtPayload;

      const tokenDoc = await this.collection.findOne({ token });

      if (!tokenDoc) {
        return ResponseHelper.error("Refresh token not found", 403);
      }

      const userId = new ObjectId(String(payload.id));
      const user = await CollectionsManager.userCollection.findOne({
        _id: userId,
      });

      if (!user) {
        return ResponseHelper.error("User no longer exists", 404);
      }
      await this.collection.deleteOne({ token });

      const newAccessToken = generateToken({ id: user._id });
      const newRefreshToken = generateToken({ id: user._id }, "5d");

      await this.collection.insertOne({
        userId: user._id,
        token: newRefreshToken,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return ResponseHelper.success({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
    } catch (err) {
      return ResponseHelper.error(String(err), 500);
    }
  }
}
export default AuthController;
