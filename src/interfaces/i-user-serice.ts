import type { ObjectId } from "mongodb";

export interface IUserService {
  findUserById(userId: ObjectId): Promise<Response>;
  getAllUsers(): Promise<Response>;
}
