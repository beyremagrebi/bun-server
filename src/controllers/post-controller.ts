import type { Collection } from "mongodb";
import type { Post as PostModel } from "../models/post";

import { CollectionsManager } from "../models/base/collection-manager";
import { BaseController } from "./base/base-controller";

class PostController extends BaseController<PostModel> {
  constructor() {
    super("/post");
  }
  protected initializeCollection(): Collection<PostModel> {
    return CollectionsManager.postCollection;
  }
}

export default PostController;
