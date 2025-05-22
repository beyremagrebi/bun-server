import type { Collection, OptionalUnlessRequiredId } from "mongodb";

import type { User } from "../models/user";
import { Get, Post } from "../routes/router-manager";

import { paginationMiddleware } from "../middleware/pagination-middleware";
import { CollectionsManager } from "../models/base/collection-manager";
import { ResponseHelper } from "../utils/response-helper";
import { BaseController } from "./base/base-controller";
import { authMiddleware } from "../middleware/aut-middleware";

class UserController extends BaseController<User> {
  constructor() {
    super("/user");
  }
  protected initializeCollection(): Collection<User> {
    return CollectionsManager.userCollection;
  }
  @Post("/add-user")
  async create(req: Request): Promise<Response> {
    try {
      const body =
        await this.parseRequestBody<OptionalUnlessRequiredId<User>>(req);
      const hashPassword = await Bun.password.hash(body.password);
      body.password = hashPassword;
      const { insertedId } = await this.collection.insertOne(body);

      return ResponseHelper.success({ id: insertedId, ...body });
    } catch (err) {
      return ResponseHelper.error(String(err));
    }
  }

  @Get("/getAll", [authMiddleware, paginationMiddleware])
  getAll(req: Request): Promise<Response> {
    return super.getAll(req);
  }
}

export default UserController;
