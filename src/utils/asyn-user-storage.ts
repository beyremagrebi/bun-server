import { ObjectId } from "mongodb";
import { CollectionsManager } from "../models/base/collection-manager";

export async function syncUserStorageDelta(
  userId: string | ObjectId,
  deltaBytes: number,
) {
  const id = typeof userId === "string" ? new ObjectId(userId) : userId;
  const size = formatFileSize(deltaBytes);
  await CollectionsManager.userStrorageCollection.findOneAndUpdate(
    { userId: id },
    {
      $inc: { usedStorage: deltaBytes },
      $set: { updatedAt: new Date(), readableSize: size },
    },
    { upsert: true },
  );
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
