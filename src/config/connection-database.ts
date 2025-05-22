import { MongoClient } from "mongodb";
import { CollectionsManager } from "../models/base/collection-manager";

// Database connection and collections
let client: MongoClient;

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
