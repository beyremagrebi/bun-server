import fs from "fs/promises";
import path from "path";
import { ConnectionDatabase } from "../src/config/connection-database";
import { EnvLoader } from "../src/config/env";
import { Logger } from "../src/config/logger";
import { CollectionsManager } from "../src/models/base/collection-manager";

const DEFAULT_MAX_STORAGE = 1 * 1024 * 1024 * 1024; // 1 GB

function formatBytes(bytes: number): string {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "0 Bytes";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + " " + sizes[i];
}

async function calculateDirectorySize(dir: string): Promise<number> {
  let total = 0;
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        total += await calculateDirectorySize(fullPath);
      } else {
        const stat = await fs.stat(fullPath);
        total += stat.size;
      }
    }
  } catch (err) {
    Logger.error(`${err}`);
  }
  return total;
}

async function updateAllUserStorage() {
  try {
    // Initialize DB connection
    await ConnectionDatabase.connect(EnvLoader.uri);

    const usersCollection = CollectionsManager.userCollection;
    const storageCollection = CollectionsManager.userStrorageCollection;

    if (!usersCollection || !storageCollection) {
      throw new Error("Collections are not initialized.");
    }

    const users = await usersCollection
      .find({}, { projection: { _id: 1 } })
      .toArray();

    for (const user of users) {
      const userId = user._id;
      const uploadPath = path.join(
        process.cwd(),
        "uploads",
        `images-${userId.toString()}`,
      );

      const usedStorage = await calculateDirectorySize(uploadPath);
      const readableSize = formatBytes(usedStorage);

      await storageCollection.updateOne(
        { userId },
        {
          $set: {
            usedStorage,
            readableSize,
            maxStorage: DEFAULT_MAX_STORAGE,
            updatedAt: new Date(),
          },
          $setOnInsert: {
            createdAt: new Date(),
          },
        },
        { upsert: true },
      );

      Logger.info(`Updated ${userId}: ${readableSize}`, false);
    }

    Logger.success("All users processed.", false);
  } catch (err) {
    Logger.error(`Failed to update user storage:${err}`, true);
  }
}

updateAllUserStorage();
