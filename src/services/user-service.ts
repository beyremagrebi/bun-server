import { ObjectId } from "mongodb";
import type { IUserService } from "../interfaces/i-user-serice";
import type { IUserRepository } from "../interfaces/user/i-user-repository";
import { ResponseHelper } from "../utils/response-helper";

export class UserService implements IUserService {
  constructor(private userRepository: IUserRepository) {}
  async findUserById(userId: ObjectId | undefined): Promise<Response> {
    if (!userId || !ObjectId.isValid(userId)) {
      return ResponseHelper.error("Invalid user ID format", 400);
    }

    const user = await this.userRepository.findById(userId);
    return ResponseHelper.success(user);
  }

  async getAllUsers(): Promise<Response> {
    const users = await this.userRepository.findAll();
    return ResponseHelper.success(users);
  }
}
