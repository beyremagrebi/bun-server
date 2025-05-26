import { Collection } from "mongodb";
import { authMiddleware } from "../middleware/aut-middleware";
import { paginationMiddleware } from "../middleware/pagination-middleware";
import { CollectionsManager } from "../models/base/collection-manager";
import { Get, Put } from "../routes/router-manager";

import type { ServerRequest } from "../config/interfaces/i-request";
import type { User } from "../models/user";

import { UserService } from "../services/user-service";
import { ResponseHelper } from "../utils/response-helper";
import { BaseController } from "./base/base-controller";
import type { RequestWithPagination } from "../config/interfaces/i-pagination";
import type { ChangePasswordPayload } from "../interfaces/user/i-crud-controller";
import { userRepository } from "../repositories/user-repository";

class UserController extends BaseController<User> {
  private userService: UserService;

  constructor() {
    super("/user");
    this.userService = new UserService(new userRepository());
  }

  protected initializeCollection(): Collection<User> {
    return CollectionsManager.userCollection;
  }

  @Get("/getAll", [authMiddleware, paginationMiddleware])
  async getAll(req: RequestWithPagination): Promise<Response> {
    try {
      return super.getAll(req);
    } catch (err) {
      return ResponseHelper.serverError(String(err));
    }
  }

  @Get("/by-id", [authMiddleware])
  async getById(req: ServerRequest): Promise<Response> {
    try {
      return this.userService.findUserById(req.user?._id);
    } catch (err) {
      return ResponseHelper.serverError(String(err));
    }
  }
  @Put("/change-password", [authMiddleware])
  async changePassword(req: ServerRequest): Promise<Response> {
    try {
      const body = await this.parseRequestBody<ChangePasswordPayload>(req);
      return this.userService.changePassword(req.user?._id, body);
    } catch (err) {
      return ResponseHelper.serverError(String(err));
    }
  }
}

export default UserController;
