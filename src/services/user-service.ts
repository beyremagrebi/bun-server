import { ObjectId } from "mongodb";
import type { IUserService } from "../interfaces/i-user-serice";
import type { IUserRepository } from "../interfaces/user/i-user-repository";
import { ResponseHelper } from "../utils/response-helper";
import type { ChangePasswordPayload } from "../interfaces/user/i-crud-controller";
import type { ServerRequest } from "../config/interfaces/i-request";
import { UPLOAD_PATHS } from "../config/config";
import {
  deleteFiles,
  handleFileUpload,
  type UploadResult,
} from "../utils/upload-helper";
import type { User } from "../models/user";

export class UserService implements IUserService {
  constructor(private userRepository: IUserRepository) {}
  async findUserById(userId: ObjectId | undefined): Promise<Response> {
    if (!userId || !ObjectId.isValid(userId)) {
      return ResponseHelper.error("Invalid user ID format", 400);
    }

    const user = await this.userRepository.findById(userId, 0);
    return ResponseHelper.success(user);
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

  async updateProfile(
    req: ServerRequest,
    user: User,
    formData: FormData,
  ): Promise<Response> {
    try {
      const userId = req.user?._id;
      const storePath = `${UPLOAD_PATHS.images}-${userId}`;

      if (user.userName) {
        const existingUser = await this.userRepository.findByUsername(
          user.userName,
        );
        if (
          existingUser &&
          existingUser._id?.toString() !== userId?.toString()
        ) {
          return ResponseHelper.error("Username already exists", 400);
        }
      }
      const currentUser = await this.userRepository.findById(userId, 0);
      if (!currentUser) {
        return ResponseHelper.error("User not found", 404);
      }

      if (formData.has("image")) {
        const result = (await handleFileUpload(formData, {
          fieldName: "image",
          storePath,
          fileName: new Date().getTime().toString(),
          multiple: false,
          writeToDisk: true,
        })) as UploadResult;

        if (result?.fileName) {
          if (currentUser.image) {
            deleteFiles(currentUser.image, storePath);
          }
          user.image = result.fileName;
        } else {
          user.image = currentUser.image;
        }
      }

      const updatedUser = await this.userRepository.updateProfile(userId, user);
      return ResponseHelper.success(updatedUser);
    } catch (error) {
      return ResponseHelper.serverError(String(error));
    }
  }
}
