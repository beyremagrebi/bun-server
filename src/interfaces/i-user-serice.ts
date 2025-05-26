import type { ObjectId } from "mongodb";
import type { ChangePasswordPayload } from "./user/i-crud-controller";

export interface IUserService {
  findUserById(userId: ObjectId): Promise<Response>;
  changePassword(
    userId: ObjectId | undefined,
    body: ChangePasswordPayload,
  ): Promise<Response>;
  getAllUsers(): Promise<Response>;
}
