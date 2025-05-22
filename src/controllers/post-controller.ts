import type { Collection } from "mongodb";
import { postCollection } from "../config/connection-database";
import type { Post as PostModel } from "../models/post";
import { Get, Post } from "../routes/router-manager";

import { BaseController } from "./base-controller";

class PostController extends BaseController<PostModel> {
  constructor() {
    super("/post");
  }
  protected initializeCollection(): Collection<PostModel> {
    return postCollection;
  }
  @Post("/add-Post")
  create(req: Request): Promise<Response> {
    return super.create(req);
  }
  @Get("/getAll")
  getAll(): Promise<Response> {
    return super.getAll();
  }
}

export default PostController;
