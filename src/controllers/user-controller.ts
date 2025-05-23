import type { Collection, OptionalUnlessRequiredId } from "mongodb";

import type { User } from "../models/user";
import { Get, Post } from "../routes/router-manager";

import validator from "validator";
import type { ServerRequest } from "../interfaces/i-request";
import { authMiddleware } from "../middleware/aut-middleware";
import { paginationMiddleware } from "../middleware/pagination-middleware";
import { CollectionsManager } from "../models/base/collection-manager";
import { ResponseHelper } from "../utils/response-helper";
import { UtilsFunc } from "../utils/utils-func";
import { BaseController } from "./base/base-controller";

class UserController extends BaseController<User> {
  constructor() {
    super("/user");
  }
  protected initializeCollection(): Collection<User> {
    return CollectionsManager.userCollection;
  }
  @Post("/add-user")
  async create(req: ServerRequest): Promise<Response> {
    try {
      const body =
        await this.parseRequestBody<OptionalUnlessRequiredId<User>>(req);

      if (!body.email || !body.password || !body.firstName || !body.lastName) {
        return ResponseHelper.error(
          "Cannot create user: Missing required fields",
          400,
        );
      }
      if (!validator.isEmail(body.email)) {
        return ResponseHelper.error("Invalid email format", 400);
      }

      const emailExists = await this.collection.findOne({ email: body.email });
      if (emailExists) {
        return ResponseHelper.error("Email already in use", 409);
      }

      const baseUsername = `${body.firstName.toLowerCase()}${body.lastName.toLowerCase()}`;
      const userExists = await this.collection.findOne({
        userName: baseUsername,
      });
      const isSafe = !userExists;

      const userName = await UtilsFunc.createUsernameGenerator(
        isSafe,
      ).generateUserName(body.firstName, body.lastName);

      const hashPassword = await Bun.password.hash(body.password);
      body.password = hashPassword;
      body.userName = userName;
      body.createdAt = new Date();
      body.updatedAt = new Date();
      await this.collection.insertOne(body);

      return ResponseHelper.success(body);
    } catch (err) {
      return ResponseHelper.error(String(err));
    }
  }

  @Get("/getAll", [authMiddleware, paginationMiddleware])
  async getAll(req: ServerRequest): Promise<Response> {
    return super.getAll(req);
  }
}

export default UserController;
