import type { Collection, MongoClient } from "mongodb";
import { EnvLoader } from "../../config/env";
import type { User } from "../user";
import type { Post } from "../post";

export class CollectionsManager {
  static userCollection: Collection<User>;
  static postCollection: Collection<Post>;

  static initializeCollections(client: MongoClient) {
    const db = client.db(EnvLoader.databaseName);
    this.userCollection = db.collection<User>("users");
    this.postCollection = db.collection<Post>("posts");
  }

  static get collections() {
    return {
      users: this.userCollection,
      posts: this.postCollection,
    };
  }
}
