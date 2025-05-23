import { ObjectId, type OptionalUnlessRequiredId } from "mongodb";
import validator from "validator";
import type { IUserRepository } from "../interfaces/user/i-user-repository";
import { CollectionsManager } from "../models/base/collection-manager";
import type { User } from "../models/user";

export class UserRepository implements IUserRepository {
  private collection = CollectionsManager.userCollection;

  async findById(userId: ObjectId): Promise<User | null> {
    return this.collection.findOne({ _id: userId });
  }

  async findByIdentifier(identifier: string): Promise<User | null> {
    const isEmail = validator.isEmail(identifier);
    const query = isEmail ? { email: identifier } : { userName: identifier };
    return this.collection.findOne(query);
  }

  async create(user: OptionalUnlessRequiredId<User>): Promise<void> {
    await this.collection.insertOne(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.collection.findOne({ email });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.collection.findOne({ userName: username });
  }

  async findAll(): Promise<User[]> {
    return this.collection.find().toArray();
  }
}
