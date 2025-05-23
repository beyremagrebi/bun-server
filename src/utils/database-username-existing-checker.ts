import { CollectionsManager } from "../models/base/collection-manager";
import type { UsernameExistenceChecker } from "./interfaces/i-user-existing-checket";

export class DatabaseUsernameExistenceChecker
  implements UsernameExistenceChecker
{
  constructor() {}

  async usernameExists(username: string): Promise<boolean> {
    try {
      const user = await CollectionsManager.userCollection.findOne({
        userName: username,
      });
      return !!user;
    } catch (err) {
      console.error(err);
      return false;
    }
  }
}
