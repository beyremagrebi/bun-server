import type { Collection, MongoClient } from "mongodb";
import { EnvLoader } from "../../config/env";
import type { User } from "../user";
import type { Post } from "../post";
import type { RefreshToken } from "../refresh-token";

export class CollectionsManager {
  static userCollection: Collection<User>;
  static postCollection: Collection<Post>;
  static refreshCollection: Collection<RefreshToken>;

  static initializeCollections(client: MongoClient) {
    const db = client.db(EnvLoader.databaseName);
    this.userCollection = db.collection<User>("users");
    this.postCollection = db.collection<Post>("posts");
    this.refreshCollection = db.collection<RefreshToken>("refresh-tokens");
  }

  static get collections() {
    return {
      users: this.userCollection,
      posts: this.postCollection,
    };
  }
}
