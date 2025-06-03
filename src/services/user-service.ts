import { ObjectId } from "mongodb";
import { UPLOAD_PATHS } from "../config/config";
import type { ServerRequest } from "../config/interfaces/i-request";
import type { ChangePasswordPayload } from "../interfaces/base/i-crud-controller";
import type { IUserRepository } from "../interfaces/user/i-user-repository";
import type { IUserService } from "../interfaces/user/i-user-service";
import { CollectionsManager } from "../models/base/collection-manager";
import type { User } from "../models/user";
import { ResponseHelper } from "../utils/response-helper";
import {
  deleteFiles,
  handleFileUpload,
  type UploadResult,
} from "../utils/upload-helper";
import { BaseService } from "./base/base-service";

export class UserService extends BaseService<User> implements IUserService {
  constructor(private userRepository: IUserRepository) {
    super(CollectionsManager.userCollection);
  }
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
    const userId = req.user?._id;
    const storePath = `${UPLOAD_PATHS.images}-${userId}`;

    if (user.userName) {
      const existingUser = await this.userRepository.findByUsername(
        user.userName,
      );
      if (existingUser && existingUser._id?.toString() !== userId?.toString()) {
        return ResponseHelper.error("Username already exists", 400);
      }
    }
    if (user.email) {
      const existingUser = await this.userRepository.findByEmail(user.email);
      if (existingUser && existingUser._id?.toString() !== userId?.toString()) {
        return ResponseHelper.error("email already exists", 400);
      }
    }

    const currentUser = await this.userRepository.findById(userId, 0);
    if (!currentUser) {
      return ResponseHelper.error("User not found", 404);
    }

    // Handle profile image update
    if (formData.has("image")) {
      const result = (await handleFileUpload(formData, {
        fieldName: "image",
        storePath,
        fileName: new Date().getTime().toString(),
        multiple: false,
        writeToDisk: true,
        userId: userId,
      })) as UploadResult;

      if (result?.fileName) {
        if (currentUser.image) {
          deleteFiles(currentUser.image, storePath, currentUser._id);
        }
        user.image = result.fileName;
      } else {
        user.image = currentUser.image;
      }
    }

    // Handle cover image update
    if (formData.has("cover")) {
      const result = (await handleFileUpload(formData, {
        fieldName: "cover",
        storePath,
        fileName: new Date().getTime().toString() + "_cover",
        multiple: false,
        writeToDisk: true,
        userId: userId,
      })) as UploadResult;

      if (result?.fileName) {
        if (currentUser.cover) {
          deleteFiles(currentUser.cover, storePath, currentUser._id);
        }
        user.cover = result.fileName;
      } else {
        if (currentUser.cover) {
          deleteFiles(currentUser.cover, storePath, currentUser._id);
        }
        user.cover = "";
      }
    }

    const updatedUser = await this.userRepository.updateProfile(userId, user);
    return ResponseHelper.success(updatedUser);
  }
}
