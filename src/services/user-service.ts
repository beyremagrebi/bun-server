import { ObjectId } from "mongodb";
import type { IUserService } from "../interfaces/i-user-serice";
import type { IUserRepository } from "../interfaces/user/i-user-repository";
import { ResponseHelper } from "../utils/response-helper";
import type { ChangePasswordPayload } from "../interfaces/user/i-crud-controller";

export class UserService implements IUserService {
  constructor(private userRepository: IUserRepository) {}
  async findUserById(userId: ObjectId | undefined): Promise<Response> {
    if (!userId || !ObjectId.isValid(userId)) {
      return ResponseHelper.error("Invalid user ID format", 400);
    }

    const user = await this.userRepository.findById(userId, 0);
    return ResponseHelper.success(user);
  }

  async getAllUsers(): Promise<Response> {
    const users = await this.userRepository.findAll();
    return ResponseHelper.success(users);
  }

  async changePassword(
    userId: ObjectId | undefined,
    body: ChangePasswordPayload,
  ): Promise<Response> {
    if (!userId) {
      return ResponseHelper.error("User ID is required");
    }

    const user = await this.userRepository.findById(userId, 1);
    if (!user) {
      return ResponseHelper.error("User not found");
    }

    const isOldPasswordCorrect = await Bun.password.verify(
      body.oldPassword,
      user.password,
    );
    if (!isOldPasswordCorrect) {
      return ResponseHelper.error("Old password is incorrect");
    }

    const isSameAsOld = await Bun.password.verify(
      body.newPassword,
      user.password,
    );
    if (isSameAsOld) {
      return ResponseHelper.error(
        "New password must be different from the old password",
      );
    }

    const hashPassword = await Bun.password.hash(body.newPassword);
    await this.userRepository.changePassword(userId, hashPassword);

    return ResponseHelper.success("Password changed successfully");
  }
}
