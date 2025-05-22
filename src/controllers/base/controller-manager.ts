import PostController from "../post-controller";
import UserController from "../user-controller";

export class ControllerManager {
  static getAllControllers() {
    return [UserController, PostController];
  }
}
