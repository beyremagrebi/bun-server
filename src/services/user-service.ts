import type { OptionalUnlessRequiredId } from "mongodb";
import validator from "validator";
import type { IUserService } from "../interfaces/i-user-serice";
import type { IUserRepository } from "../interfaces/user/i-user-repository";
import type { User } from "../models/user";
import { ResponseHelper } from "../utils/response-helper";
import { UtilsFunc } from "../utils/utils-func";

export class UserService implements IUserService {
  constructor(private userRepository: IUserRepository) {}

  async createUser(
    userData: OptionalUnlessRequiredId<User>,
  ): Promise<Response> {
    if (
      !userData.email ||
      !userData.password ||
      !userData.firstName ||
      !userData.lastName
    ) {
      return ResponseHelper.error(
        "Cannot create user: Missing required fields",
        400,
      );
    }

    if (!validator.isEmail(userData.email)) {
      return ResponseHelper.error("Invalid email format", 400);
    }

    const emailExists = await this.userRepository.findByEmail(userData.email);
    if (emailExists) {
      return ResponseHelper.error("Email already in use", 409);
    }

    const baseUsername = `${userData.firstName.toLowerCase()}${userData.lastName.toLowerCase()}`;
    const userExists = await this.userRepository.findByUsername(baseUsername);
    const isSafe = !userExists;

    const userName = await UtilsFunc.createUsernameGenerator(
      isSafe,
    ).generateUserName(userData.firstName, userData.lastName);

    const hashPassword = await Bun.password.hash(userData.password);

    const newUser: OptionalUnlessRequiredId<User> = {
      ...userData,
      password: hashPassword,
      userName,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.userRepository.create(newUser);

    return ResponseHelper.success(newUser);
  }

  async getAllUsers(): Promise<Response> {
    const users = await this.userRepository.findAll();
    return ResponseHelper.success(users);
  }
}
