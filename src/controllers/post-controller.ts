import type { Collection } from "mongodb";
import type { Post as PostModel } from "../models/post";
import { Get, Post } from "../routes/router-manager";

import { CollectionsManager } from "../models/base/collection-manager";
import { BaseController } from "./base/base-controller";

class PostController extends BaseController<PostModel> {
  constructor() {
    super("/post");
  }
  protected initializeCollection(): Collection<PostModel> {
    return CollectionsManager.postCollection;
  }
  @Post("/add-Post")
  create(req: Request): Promise<Response> {
    return super.create(req);
  }
  @Get("/getAll")
  getAll(req: Request): Promise<Response> {
    return super.getAll(req);
  }
}

export default PostController;
