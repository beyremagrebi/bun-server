import type { Collection } from "mongodb";
import { userCollection } from "../config/connection-database";
import type { User } from "../models/user";
import { Get, Post } from "../routes/router-manager";

import { authMiddleware } from "../middleware/aut-middleware";
import { BaseController } from "./base-controller";

class UserController extends BaseController<User> {
  constructor() {
    super("/user");
  }
  protected initializeCollection(): Collection<User> {
    return userCollection;
  }
  @Post("/add-user")
  create(req: Request): Promise<Response> {
    return super.create(req);
  }
  @Get("/getAll", [authMiddleware])
  getAll(): Promise<Response> {
    return super.getAll();
  }
}

export default UserController;
