import { Collection, type OptionalUnlessRequiredId } from "mongodb";
import { authMiddleware } from "../middleware/aut-middleware";
import { paginationMiddleware } from "../middleware/pagination-middleware";
import { CollectionsManager } from "../models/base/collection-manager";
import { Get, Post } from "../routes/router-manager";

import type { ServerRequest } from "../config/interfaces/i-request";
import type { User } from "../models/user";
import { UserRepository } from "../repositories/user-repository";
import { UserService } from "../services/user-service";
import { ResponseHelper } from "../utils/response-helper";
import { BaseController } from "./base/base-controller";

class UserController extends BaseController<User> {
  private userService: UserService;

  constructor() {
    super("/user");
    this.userService = new UserService(new UserRepository());
  }

  protected initializeCollection(): Collection<User> {
    return CollectionsManager.userCollection;
  }

  @Post("/add-user")
  async create(req: ServerRequest): Promise<Response> {
    try {
      const body =
        await this.parseRequestBody<OptionalUnlessRequiredId<User>>(req);
      return this.userService.createUser(body);
    } catch (err) {
      return ResponseHelper.error(String(err));
    }
  }

  @Get("/getAll", [authMiddleware, paginationMiddleware])
  async getAll(): Promise<Response> {
    try {
      return this.userService.getAllUsers();
    } catch (err) {
      return ResponseHelper.error(String(err));
    }
  }

  @Get("/by-id/:id", [authMiddleware])
  async getById(req: ServerRequest): Promise<Response> {
    try {
      return this.userService.findUserById(String(req.params.id));
    } catch (err) {
      return ResponseHelper.error(String(err));
    }
  }
}

export default UserController;
