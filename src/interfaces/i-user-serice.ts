import type { OptionalUnlessRequiredId } from "mongodb";
import type { User } from "../models/user";

export interface IUserService {
  createUser(userData: OptionalUnlessRequiredId<User>): Promise<Response>;
  getAllUsers(): Promise<Response>;
}
