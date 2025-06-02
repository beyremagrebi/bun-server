import type { ObjectId } from "mongodb";
import type { ServerRequest } from "../../config/interfaces/i-request";
import type { User } from "../../models/user";
import type { ChangePasswordPayload } from "../base/i-crud-controller";

export interface IUserService {
  findUserById(userId: ObjectId): Promise<Response>;
  changePassword(
    userId: ObjectId | undefined,
    body: ChangePasswordPayload,
  ): Promise<Response>;
  updateProfile(
    req: ServerRequest,
    user: User,
    formData: FormData,
  ): Promise<Response>;
}
