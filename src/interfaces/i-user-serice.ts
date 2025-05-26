import type { OptionalUnlessRequiredId } from "mongodb";
import type { User } from "../models/user";

export interface IUserService {
  createUser(userData: OptionalUnlessRequiredId<User>): Promise<Response>;
  findUserById(userId: string): Promise<Response>;
  getAllUsers(): Promise<Response>;
}
