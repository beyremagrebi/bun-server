import { Collection, MongoClient } from "mongodb";
import { EnvLoader } from "./env";
import type { User } from "../models/user";
import type { Post } from "../models/post";
import { CollectionsManager } from "../models/base/collection-manager";

// Database connection and collections
let client: MongoClient;
let userCollection: Collection<User>;
let postCollection: Collection<Post>;

export class ConnectionDatabase {
  static async connect(uri: string): Promise<void> {
    try {
      if (!uri) {
        throw new Error("MongoDB URI is not provided");
      }

      client = await MongoClient.connect(uri);
      CollectionsManager.initializeCollections(client);
    } catch (error) {
      console.error("MongoDB connection error:", error);
      throw error;
    }
  }

  static async disconnect(): Promise<void> {
    try {
      if (client) {
        await client.close();
        console.log("MongoDB connection closed");
      }
    } catch (error) {
      console.error("Error closing MongoDB connection:", error);
      throw error;
    }
  }
}
