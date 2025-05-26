import type { ObjectId } from "mongodb";

export interface IUserService {
  findUserById(userId: ObjectId): Promise<Response>;
  changePassword(): Promise<Response>;
  getAllUsers(): Promise<Response>;
}
