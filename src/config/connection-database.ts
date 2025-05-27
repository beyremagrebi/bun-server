import { MongoClient } from "mongodb";
import { CollectionsManager } from "../models/base/collection-manager";
import { Logger } from "./logger";

// Database connection and collections
let client: MongoClient;

export class ConnectionDatabase {
  static async connect(uri: string): Promise<void> {
    try {
      if (!uri) {
        Logger.error(
          "MongoDB URI is not provided. Please set the MONGO_URI environment variable.",
        );
        return;
      }

      client = await MongoClient.connect(uri);
      Logger.success("Database connected", false);
      CollectionsManager.initializeCollections(client);
    } catch (error) {
      Logger.error(`MongoDB connection error: ${error}`);
    }
  }

  static async disconnect(): Promise<void> {
    try {
      if (client) {
        await client.close();
        Logger.error("MongoDB connection closed");
      }
    } catch (error) {
      Logger.error(`Error closing MongoDB connection: ${error}`);
      throw error;
    }
  }
}
