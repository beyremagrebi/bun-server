import { Collection, MongoClient } from "mongodb";
import { EnvLoader } from "./env";
import type { User } from "../models/user";

// Database connection and collections
let client: MongoClient;
let userCollection: Collection<User>;

export class ConnectionDatabase {
  static async connect(uri: string): Promise<void> {
    try {
      if (!uri) {
        throw new Error("MongoDB URI is not provided");
      }

      client = await MongoClient.connect(uri);
      userCollection = client.db(EnvLoader.databaseName).collection<User>("users");
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

// Export the userCollection getter
export { userCollection };
