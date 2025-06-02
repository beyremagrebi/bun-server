import { authMiddleware } from "../middleware/aut-middleware";
import { paginationMiddleware } from "../middleware/pagination-middleware";
import { CollectionsManager } from "../models/base/collection-manager";
import { Get, Put } from "../routes/router-manager";

import type { ServerRequest } from "../config/interfaces/i-request";
import type { User } from "../models/user";

import type { RequestWithPagination } from "../config/interfaces/i-pagination";
import type { ChangePasswordPayload } from "../interfaces/base/i-crud-controller";

import type { Collection } from "mongodb";
import { userRepository } from "../repositories/user-repository";
import { UserService } from "../services/user-service";
import { ResponseHelper } from "../utils/response-helper";
import { BaseController } from "./base/base-controller";

class UserController extends BaseController<User, UserService> {
  protected createService(): UserService {
    return new UserService(new userRepository());
  }

  constructor() {
    super("/user");
    this.initializeService(this.createService());
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

  @Get("/current-user", [authMiddleware])
  async getCurrentUser(req: ServerRequest): Promise<Response> {
    try {
      return this.service.findUserById(req.user?._id);
    } catch (err) {
      return ResponseHelper.serverError(String(err));
    }
  }
  @Get("/by-id/:id", [authMiddleware])
  async getUserById(req: ServerRequest): Promise<Response> {
    try {
      return this.service.findUserById(req.user?._id);
    } catch (err) {
      return ResponseHelper.serverError(String(err));
    }
  }

  @Put("/change-password", [authMiddleware])
  async changePassword(req: ServerRequest): Promise<Response> {
    try {
      const body = await this.parseRequestBody<ChangePasswordPayload>(req);
      return this.service.changePassword(req.user?._id, body);
    } catch (err) {
      return ResponseHelper.serverError(String(err));
    }
  }

  @Put("/update-profile", [authMiddleware])
  async updateProfile(req: ServerRequest): Promise<Response> {
    try {
      const formData = (await req.formData()) as unknown as FormData;
      const body = await this.parseFormData<User>(formData);
      return this.service.updateProfile(req, body, formData);
    } catch (err) {
      return ResponseHelper.serverError(String(err));
    }
  }
}

export default UserController;
