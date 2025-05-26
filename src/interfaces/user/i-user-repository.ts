import { ObjectId, type OptionalUnlessRequiredId } from "mongodb";
import type { User } from "../../models/user";

export interface IUserRepository {
  findById(userId: ObjectId, withPassword: number): Promise<User | null>;
  findByIdentifier(identifier: string): Promise<User | null>;
  create(user: OptionalUnlessRequiredId<User>): Promise<void>;
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  changePassword(
    userId: ObjectId | undefined,
    newPassword: string,
  ): Promise<void>;
}
