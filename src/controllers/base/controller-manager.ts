import AuthController from "../auth-controller";
import { ExperienceController } from "../experience-controller";
import PostController from "../post-controller";
import { SkillController } from "../skill-controller";
import UserController from "../user-controller";

export class ControllerManager {
  static getAllControllers() {
    return [
      UserController,
      PostController,
      AuthController,
      SkillController,
      ExperienceController,
    ];
  }
}
