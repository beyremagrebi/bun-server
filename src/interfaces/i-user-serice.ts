import type { ObjectId, OptionalUnlessRequiredId } from "mongodb";
import type { User } from "../models/user";

export interface IUserService {
  createUser(userData: OptionalUnlessRequiredId<User>): Promise<Response>;
  findUserById(userId: ObjectId): Promise<Response>;
  getAllUsers(): Promise<Response>;
}
